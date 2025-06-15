// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});
const prisma = new PrismaClient();

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutRequestBody {
  email: string;
  cart: CartItem[];
  totalAmount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { email, cart, totalAmount } = body;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/order-confirmation`,
      cancel_url: `${process.env.NEXTAUTH_URL}/products`,
      customer_email: email,
      metadata: {
        email,
        cartItems: JSON.stringify(cart),
      },
    });

    // Create order in database
    await prisma.order.create({
      data: {
        email,
        totalAmount,
        status: "PENDING",
        stripePaymentIntentId: session.id,
        items: {
          create: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
