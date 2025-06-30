// app/api/create-checkout-session/route.ts (Revised to fix URL issue)

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; // Assuming this path is correct
import type { CartItem, DeliveryFormData } from "@/types"; // It's good practice to have shared types

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

// --- FIX: The Reliable URL Helper Function ---
// This function ensures the base URL is always a full, valid URL with a protocol.
const getBaseUrl = () => {
  // If running on Vercel, VERCEL_URL is provided with the deployment domain.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Otherwise, fall back to the local development URL.
  // Ensure NEXT_PUBLIC_BASE_URL in your .env.local is "http://localhost:3000"
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};

export async function POST(request: Request) {
  try {
    const {
      cart,
      deliveryInfo,
    }: { cart: CartItem[]; deliveryInfo: DeliveryFormData } =
      await request.json();

    if (!cart?.length || !deliveryInfo) {
      return NextResponse.json(
        { error: "Missing cart or delivery information" },
        { status: 400 }
      );
    }

    /* ─────────────────────────────
       1.  QUICK STOCK PRE-CHECK (Your logic is perfect, no changes)
    ──────────────────────────────*/
    for (const item of cart) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!dbProduct || dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}` },
          { status: 409 } // 409 Conflict is a great status code here
        );
      }
    }

    /* ─────────────────────────────
       2.  PREP ORDER DATA (Your logic is perfect, no changes)
    ──────────────────────────────*/
    const orderIdHuman = `ORD-${Date.now()
      .toString(36)
      .slice(-6)
      .toUpperCase()}`;
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of cart) {
      const dbProduct = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      const price = dbProduct!.price;
      totalAmount += price * item.quantity;
      orderItemsData.push({
        productId: dbProduct!.id,
        name: dbProduct!.name,
        price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        variantId: item.variantId,
        variantName: item.variantName,
      });
    }

    /* ─────────────────────────────
       3.  CREATE ORDER (PENDING) (Your transaction logic is excellent, no changes)
    ──────────────────────────────*/
    const order = await prisma.$transaction(async (tx) => {
      const shippingAddress = await tx.address.create({
        data: {
          street: deliveryInfo.address,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
          postalCode: deliveryInfo.zipCode,
          country: deliveryInfo.country,
        },
      });
      return tx.order.create({
        data: {
          orderId: orderIdHuman,
          customerEmail: deliveryInfo.email,
          customerName: deliveryInfo.fullName,
          customerPhone: deliveryInfo.phone,
          totalAmount,
          specialInstructions: deliveryInfo.specialInstructions,
          shippingAddressId: shippingAddress.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          orderItems: { create: orderItemsData },
          transactions: {
            create: { amount: totalAmount, currency: "USD", status: "PENDING" },
          },
        },
        include: { transactions: true },
      });
    });

    // --- Get the reliable base URL once ---
    const baseUrl = getBaseUrl();

    /* ─────────────────────────────
       4.  STRIPE CHECKOUT SESSION (Applying the URL fix here)
    ──────────────────────────────*/
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: deliveryInfo.email,
      line_items: orderItemsData.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name:
              item.name + (item.variantName ? ` (${item.variantName})` : ""),
            // --- FIX: Ensure image URLs are absolute ---
            images: item.imageUrl ? [`${baseUrl}${item.imageUrl}`] : [],
            metadata: { productId: item.productId.toString() },
          },
        },
      })),
      // --- FIX: Construct URLs with the full, valid base URL ---
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${baseUrl}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        internalOrderId: order.id,
        transactionId: order.transactions[0].id,
      },
    });

    /* save session-id on transaction (no changes) */
    await prisma.transaction.update({
      where: { id: order.transactions[0].id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ sessionId: session.id, orderId: order.id });
  } catch (err: any) {
    console.error("CREATE-CHECKOUT-SESSION-ERROR:", err.message, err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
