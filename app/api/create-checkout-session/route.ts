// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/* ──────────────────────────────────────────────────────
   Stripe client
   ────────────────────────────────────────────────────── */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/* ──────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────── */

/* Ensure Stripe gets an absolute image URL or none at all */
function buildAbsoluteImageUrl(raw?: string | null): string | null {
  if (!raw) return null;

  // Already absolute?
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const origin = process.env.NEXTAUTH_URL?.replace(/\/$/, "");
  if (!origin) return null;

  const url = `${origin}${raw.startsWith("/") ? "" : "/"}${raw}`;
  try {
    new URL(url); // validate
    return url;
  } catch {
    return null;
  }
}

/* Include description only when non-empty (Stripe rejects "") */
function safeDescription(desc?: string | null) {
  return desc && desc.trim() ? { description: desc.trim() } : {};
}

/* ──────────────────────────────────────────────────────
   Route: POST /api/create-checkout-session
   ────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { items, deliveryInfo } = await req.json();

    /* ---------------- Auth / customer data ------------ */
    let userId: string | null = null;
    let customerEmail = "";
    let customerName = "";

    if (session?.user) {
      userId = session.user.id;
      customerEmail = session.user.email ?? "";
      customerName = session.user.name ?? "";
    }

    if (!customerEmail && deliveryInfo?.email)
      customerEmail = deliveryInfo.email;
    if (!customerName && deliveryInfo?.name) customerName = deliveryInfo.name;

    if (!customerEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    /* ---------------- Validate request ---------------- */
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart cannot be empty" },
        { status: 400 }
      );
    }

    if (!deliveryInfo) {
      return NextResponse.json(
        { error: "Delivery information required" },
        { status: 400 }
      );
    }

    const missing = [
      "address",
      "city",
      "state",
      "postalCode",
      "country",
    ].filter(
      (f) =>
        !deliveryInfo[f] ||
        (typeof deliveryInfo[f] === "string" && !deliveryInfo[f].trim())
    );
    if (missing.length) {
      return NextResponse.json(
        { error: `Missing address fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    /* ---------------- Fetch products ------------------ */
    const productIds = items.map((i: any) => i.id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
    });
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable" },
        { status: 400 }
      );
    }

    for (const item of items) {
      const p = products.find((x) => x.id === item.id)!;
      if (p.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${p.name}` },
          { status: 400 }
        );
      }
    }

    /* ---------------- Build Stripe line_items ---------- */
    let subtotal = 0;
    const lineItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.id)!;

      subtotal += Number(product.price) * item.quantity;

      const absImage = buildAbsoluteImageUrl(product.imageUrl);

      return {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(product.price) * 100),
          product_data: {
            name: product.name,
            ...safeDescription(product.description), // <- no empty strings
            ...(absImage ? { images: [absImage] } : {}),
          },
        },
        quantity: item.quantity,
      };
    });

    const shippingCost = 10.0;
    const totalAmount = subtotal + shippingCost;

    /* shipping line item */
    lineItems.push({
      price_data: {
        currency: "usd",
        unit_amount: Math.round(shippingCost * 100),
        product_data: {
          name: "Shipping",
          description: "Standard shipping",
        },
      },
      quantity: 1,
    });

    /* ---------------- Create order in DB -------------- */
    const order = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          street: deliveryInfo.address.trim(),
          city: deliveryInfo.city.trim(),
          state: deliveryInfo.state.trim(),
          zipCode: deliveryInfo.postalCode.toString(),
          country: deliveryInfo.country.trim(),
        },
      });

      const oid = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const newOrder = await tx.order.create({
        data: {
          orderId: oid,
          userId,
          customerEmail,
          customerName,
          customerPhone: deliveryInfo.phone ?? "",
          totalAmount,
          shippingAddressId: address.id,
          status: "PENDING",
          paymentStatus: "PENDING",
          specialInstructions: deliveryInfo.instructions ?? null,
        },
      });

      for (const item of items) {
        const p = products.find((pr) => pr.id === item.id)!;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: item.quantity,
            imageUrl: p.imageUrl ?? "",
          },
        });

        await tx.product.update({
          where: { id: p.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    /* ---------------- Stripe checkout session --------- */
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancelled?order_id=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: userId ?? "guest",
        customerEmail,
      },
      customer_email: customerEmail,
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      allow_promotion_codes: true,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: stripeSession.id },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
  } catch (err: any) {
    console.error("❌ CREATE-CHECKOUT-SESSION-ERROR:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session", message: err.message },
      { status: 500 }
    );
  }
}
