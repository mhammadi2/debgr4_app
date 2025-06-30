// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/services/emailService";

export const config = { api: { bodyParser: false } }; // raw body

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

async function rawBody(req: NextRequest) {
  const buf = await req.arrayBuffer();
  return Buffer.from(buf);
}

export async function POST(req: NextRequest) {
  const buf = await rawBody(req);
  const sig = req.headers.get("stripe-signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${e.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const orderId = session.metadata?.internalOrderId;
    const txnId = session.metadata?.transactionId;

    if (!orderId || !txnId) {
      return NextResponse.json({ error: "metadata missing" }, { status: 400 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderItems: true },
        });

        if (!order || order.paymentStatus === "PAID") return;

        /* 1. deduct stock */
        for (const itm of order.orderItems) {
          const ok = await tx.product.updateMany({
            where: { id: itm.productId, stock: { gte: itm.quantity } },
            data: { stock: { decrement: itm.quantity } },
          });
          if (!ok.count) {
            throw new Error(`Insufficient stock for ${itm.name}`);
          }
        }

        /* 2. update order & transaction */
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PROCESSING",
            paymentStatus: "PAID",
            paymentIntent: session.payment_intent as string,
          },
        });
        await tx.transaction.update({
          where: { id: txnId },
          data: {
            status: "SUCCEEDED",
            stripePaymentId: session.payment_intent as string,
          },
        });
      });

      /* 3. e-mail */
      if (session.customer_details?.email) {
        await sendOrderConfirmationEmail(session.customer_details.email, {
          orderId,
        });
      }
    } catch (e: any) {
      console.error("webhook DB error:", e);
      return NextResponse.json({ error: "db fail" }, { status: 500 });
    }
  }

  /* handle other event types as needed … */

  return NextResponse.json({ received: true });
}
