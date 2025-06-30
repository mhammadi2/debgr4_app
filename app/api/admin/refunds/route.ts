// app/api/admin/refunds/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { adminAuthOptions } from "@/lib/admin-auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  const session = await getServerSession(adminAuthOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, amount, reason, refundType } = await request.json();

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }

    let stripeRefund = null;

    // Process Stripe refund if payment was made via Stripe
    if (order.stripePaymentIntentId) {
      try {
        stripeRefund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          amount: Math.round(amount * 100), // Convert to cents
          reason:
            reason === "duplicate" ? "duplicate" : "requested_by_customer",
          metadata: {
            orderId: orderId,
            adminId: session.user.id,
            refundType: refundType,
          },
        });
      } catch (stripeError) {
        console.error("Stripe refund error:", stripeError);
        return NextResponse.json(
          { error: "Failed to process Stripe refund" },
          { status: 500 }
        );
      }
    }

    // Create refund record in database
    const refund = await prisma.refund.create({
      data: {
        orderId,
        amount,
        reason,
        refundType,
        status: "PROCESSING",
        stripeRefundId: stripeRefund?.id,
        processedBy: session.user.id,
        processedAt: new Date(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: refundType === "FULL" ? "REFUNDED" : "PARTIALLY_REFUNDED",
        paymentStatus:
          refundType === "FULL" ? "REFUNDED" : "PARTIALLY_REFUNDED",
      },
    });

    return NextResponse.json({
      refund,
      stripeRefund: stripeRefund
        ? {
            id: stripeRefund.id,
            amount: stripeRefund.amount,
            status: stripeRefund.status,
          }
        : null,
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(adminAuthOptions);
  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const [refunds, totalCount] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          order: {
            select: {
              orderId: true,
              customerName: true,
              customerEmail: true,
              totalAmount: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.refund.count({ where }),
    ]);

    return NextResponse.json({
      refunds,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return NextResponse.json(
      { error: "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}
