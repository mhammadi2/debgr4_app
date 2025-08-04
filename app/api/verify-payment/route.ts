import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db"; // Ensure the Prisma client is correctly exported from here

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

/* Helper to convert Stripe payment status to Prisma enum */
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
      return "PENDING"; // Ensure you handle all potential status cases
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
    // Retrieve the Checkout Session with a payment intent expanded
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // Extract the order ID from metadata
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json(
        { error: "Checkout session missing orderId metadata" },
        { status: 400 }
      );
    }

    // Update the order record in the database
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: toPaymentStatus(session.payment_status), // Map status to Prisma's enum
        status: session.payment_status === "paid" ? "PROCESSING" : "PENDING",
        stripePaymentIntentId:
          (session.payment_intent as Stripe.PaymentIntent | null)?.id ?? null,
      },
      include: { orderItems: true, shippingAddress: true }, // Modify includes according to your needs
    });

    // Respond to the client with updated order information
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      paymentStatus: updatedOrder.paymentStatus,
    });
  } catch (err: any) {
    console.error("verify-payment error:", err);

    // Specific error for invalid Stripe session IDs
    if (err?.type === "StripeInvalidRequestError") {
      return NextResponse.json(
        { error: "Invalid session_id" },
        { status: 400 }
      );
    }

    // General error response for failures
    return NextResponse.json(
      { error: "Failed to verify payment", message: err.message },
      { status: 500 }
    );
  }
}
