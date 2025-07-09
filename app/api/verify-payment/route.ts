// app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db"; // <- same client used everywhere

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/* helper: Stripe → Prisma enum */
function toPaymentStatus(stripeStatus: string) {
  switch (stripeStatus) {
    case "paid":
    case "succeeded":
      return "PAID";
    case "unpaid":
    case "canceled":
    case "expired":
      return "FAILED";
    default:
      return "PENDING";
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id query param" },
      { status: 400 }
    );
  }

  try {
    /* 1️⃣  Retrieve Checkout Session (and payment_intent) */
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    /* 2️⃣  We stored this key in create-checkout-session */
    const orderId = session.metadata?.orderId; // ← changed
    if (!orderId) {
      return NextResponse.json(
        { error: "Checkout session missing orderId metadata" },
        { status: 400 }
      );
    }

    /* 3️⃣  Update order record */
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: toPaymentStatus(session.payment_status),
        status: session.payment_status === "paid" ? "PROCESSING" : "PENDING",
        stripePaymentIntentId:
          (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null,
      },
      include: { orderItems: true, shippingAddress: true },
    });

    /* 4️⃣  Respond to success page */
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);

    /* Stripe specific invalid id */
    if (err?.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid session_id" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify payment", message: err.message },
      { status: 500 }
    );
  }
}
