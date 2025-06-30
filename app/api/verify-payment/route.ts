// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

export async function GET(req: NextRequest) {
  const session_id = req.nextUrl.searchParams.get("session_id");
  if (!session_id) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    const orderId = session.metadata?.internalOrderId;
    if (!orderId) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, shippingAddress: true },
    });

    return NextResponse.json(order);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
