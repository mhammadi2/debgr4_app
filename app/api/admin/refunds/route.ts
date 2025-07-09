import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth"; // ✅ USING: Your existing auth helper
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const runtime = "nodejs";

// ✅ ADDED: Validation constants
const VALID_REFUND_TYPES = ["PARTIAL", "FULL"];
const VALID_REFUND_STATUSES = [
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];
const MAX_REFUND_AMOUNT = 50000; // $50,000 max refund limit
const MIN_REFUND_AMOUNT = 0.01; // $0.01 minimum

/**
 * POST /api/admin/refunds
 * ADMIN-ONLY: Processes a refund for an order.
 */
export async function POST(request: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { orderId, amount, reason, refundType } = await request.json();

    // ✅ IMPROVED: Enhanced validation
    if (!orderId || !amount || !reason) {
      return NextResponse.json(
        { error: "Order ID, amount, and reason are required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= MIN_REFUND_AMOUNT) {
      return NextResponse.json(
        { error: `Refund amount must be greater than ${MIN_REFUND_AMOUNT}` },
        { status: 400 }
      );
    }

    if (amount > MAX_REFUND_AMOUNT) {
      return NextResponse.json(
        {
          error: `Refund amount cannot exceed ${MAX_REFUND_AMOUNT.toLocaleString()}`,
        },
        { status: 400 }
      );
    }

    if (!reason.trim() || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Refund reason must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (refundType && !VALID_REFUND_TYPES.includes(refundType)) {
      return NextResponse.json(
        {
          error: `Invalid refund type. Must be one of: ${VALID_REFUND_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ IMPROVED: Get order with refunds to calculate total refunded
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
        refunds: {
          where: {
            status: { in: ["PROCESSING", "COMPLETED"] }, // ✅ ADDED: Only count non-failed refunds
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ IMPROVED: Better payment status validation
    if (
      order.paymentStatus !== "PAID" &&
      order.paymentStatus !== "PARTIALLY_REFUNDED"
    ) {
      return NextResponse.json(
        {
          error:
            "Order must be paid or partially refunded to process additional refunds",
          currentPaymentStatus: order.paymentStatus,
          allowedStatuses: ["PAID", "PARTIALLY_REFUNDED"],
        },
        { status: 400 }
      );
    }

    // ✅ ADDED: Check if order is cancelled
    if (order.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot process refunds for cancelled orders" },
        { status: 400 }
      );
    }

    // ✅ IMPROVED: Calculate refund limits with better precision
    const orderTotal = Number(order.totalAmount);
    const totalRefunded = order.refunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );
    const maxRefundable = Math.round((orderTotal - totalRefunded) * 100) / 100;

    if (amount > maxRefundable) {
      return NextResponse.json(
        {
          error: `Cannot refund more than ${maxRefundable.toFixed(2)}`,
          details: {
            orderTotal: orderTotal,
            alreadyRefunded: totalRefunded,
            maxRefundable: maxRefundable,
            requestedAmount: amount,
          },
        },
        { status: 400 }
      );
    }

    let stripeRefund = null;

    // ✅ IMPROVED: Process Stripe refund with better error handling
    if (order.stripePaymentIntentId || order.paymentIntent) {
      try {
        const paymentIntentId =
          order.stripePaymentIntentId || order.paymentIntent;

        // ✅ ADDED: Verify payment intent exists first
        const paymentIntent =
          await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          return NextResponse.json(
            {
              error: "Payment intent is not in a refundable state",
              paymentIntentStatus: paymentIntent.status,
            },
            { status: 400 }
          );
        }

        // ✅ ADDED: Check if there's enough charged amount to refund
        const chargedAmount = paymentIntent.amount_received / 100;
        const totalAlreadyRefunded = paymentIntent.charges.data.reduce(
          (sum, charge) => sum + charge.amount_refunded / 100,
          0
        );
        const availableToRefund = chargedAmount - totalAlreadyRefunded;

        if (amount > availableToRefund) {
          return NextResponse.json(
            {
              error: `Insufficient funds available for refund. Available: ${availableToRefund.toFixed(2)}`,
              details: {
                chargedAmount: chargedAmount,
                alreadyRefunded: totalAlreadyRefunded,
                availableToRefund: availableToRefund,
              },
            },
            { status: 400 }
          );
        }

        stripeRefund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount: Math.round(amount * 100), // Convert to cents
          reason: reason.toLowerCase().includes("duplicate")
            ? "duplicate"
            : "requested_by_customer",
          metadata: {
            orderId: orderId,
            adminId: adminUser.id || "unknown",
            adminName: adminUser.name || "Unknown Admin",
            refundType: refundType || "PARTIAL",
            reason: reason.substring(0, 500), // Stripe metadata limit
            timestamp: new Date().toISOString(),
          },
        });

        console.log("Stripe refund created:", {
          refundId: stripeRefund.id,
          orderId: orderId,
          amount: amount,
          adminId: adminUser.id,
        });
      } catch (stripeError: any) {
        console.error("Stripe refund error:", {
          error: stripeError,
          orderId: orderId,
          amount: amount,
          paymentIntentId: order.stripePaymentIntentId || order.paymentIntent,
        });

        return NextResponse.json(
          {
            error: "Failed to process Stripe refund",
            details: stripeError.message,
            code: stripeError.code,
            type: stripeError.type,
          },
          { status: 500 }
        );
      }
    }

    // ✅ IMPROVED: Use database transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create refund record
      const refund = await tx.refund.create({
        data: {
          orderId,
          amount,
          reason: reason.trim(),
          refundType: refundType || "PARTIAL",
          status: stripeRefund ? "COMPLETED" : "PROCESSING",
          stripeRefundId: stripeRefund?.id,
          processedBy: adminUser.id,
          processedAt: new Date(),
        },
      });

      // Update order payment status
      const newTotalRefunded = totalRefunded + amount;
      let newPaymentStatus = order.paymentStatus;

      if (newTotalRefunded >= orderTotal) {
        newPaymentStatus = "REFUNDED";
      } else if (newTotalRefunded > 0) {
        newPaymentStatus = "PARTIALLY_REFUNDED";
      }

      // ✅ IMPROVED: Better admin notes formatting
      const currentNotes = order.adminNotes || "";
      const refundNote = `[${new Date().toISOString()}] Refund processed: ${amount.toFixed(2)} - ${reason}`;
      const updatedNotes = currentNotes
        ? `${currentNotes}\n${refundNote}`
        : refundNote;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: newPaymentStatus,
          adminNotes: updatedNotes,
        },
      });

      return { refund, updatedOrder, newTotalRefunded };
    });

    // ✅ IMPROVED: Return comprehensive response
    return NextResponse.json(
      {
        success: true,
        refund: {
          id: result.refund.id,
          amount: Number(result.refund.amount),
          reason: result.refund.reason,
          refundType: result.refund.refundType,
          status: result.refund.status,
          createdAt: result.refund.createdAt,
          stripeRefundId: result.refund.stripeRefundId,
          processedBy: result.refund.processedBy,
          processedAt: result.refund.processedAt,
        },
        stripeRefund: stripeRefund
          ? {
              id: stripeRefund.id,
              amount: stripeRefund.amount / 100,
              status: stripeRefund.status,
              created: stripeRefund.created,
              currency: stripeRefund.currency,
              reason: stripeRefund.reason,
            }
          : null,
        orderUpdate: {
          previousPaymentStatus: order.paymentStatus,
          newPaymentStatus: result.updatedOrder.paymentStatus,
          totalRefunded: result.newTotalRefunded,
          remainingAmount: orderTotal - result.newTotalRefunded,
        },
        message: `Refund of ${amount.toFixed(2)} processed successfully`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error processing refund:", {
      error: error,
      orderId: orderId,
      adminId: adminUser?.id,
    });

    return NextResponse.json(
      {
        error: "Failed to process refund",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/refunds
 * ADMIN-ONLY: Fetches refunds with pagination and filtering.
 */
export async function GET(request: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const refundType = searchParams.get("refundType"); // ✅ ADDED: Filter by refund type
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("limit") || "10"))
    );
    const skip = (page - 1) * limit;

    // ✅ ADDED: Date filtering
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const sortBy = searchParams.get("sortBy") || "createdAt"; // ✅ ADDED: Sorting option
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    // ✅ ADDED: Filter by refund type
    if (refundType && refundType !== "all") {
      where.refundType = refundType.toUpperCase();
    }

    // ✅ IMPROVED: Enhanced search functionality
    if (search) {
      const searchTerm = search.trim();
      where.OR = [
        { reason: { contains: searchTerm, mode: "insensitive" } },
        { stripeRefundId: { contains: searchTerm, mode: "insensitive" } },
        { order: { orderId: { contains: searchTerm, mode: "insensitive" } } },
        {
          order: {
            customerName: { contains: searchTerm, mode: "insensitive" },
          },
        },
        {
          order: {
            customerEmail: { contains: searchTerm, mode: "insensitive" },
          },
        },
      ];

      // ✅ ADDED: Search by amount if it's a number
      const amountSearch = parseFloat(searchTerm);
      if (!isNaN(amountSearch)) {
        where.OR.push({ amount: amountSearch });
      }
    }

    // ✅ ADDED: Date range filtering
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // ✅ IMPROVED: Include the entire end date
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // ✅ IMPROVED: Dynamic sorting
    const orderBy: any = {};
    if (sortBy === "amount") {
      orderBy.amount = sortOrder;
    } else if (sortBy === "status") {
      orderBy.status = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [refunds, totalCount, allRefundsForSummary] = await Promise.all([
      prisma.refund.findMany({
        where,
        include: {
          order: {
            select: {
              orderId: true,
              customerName: true,
              customerEmail: true,
              totalAmount: true,
              paymentStatus: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.refund.count({ where }),
      // ✅ ADDED: Get all refunds for accurate summary
      prisma.refund.findMany({
        where,
        select: { amount: true, status: true, refundType: true },
      }),
    ]);

    // ✅ IMPROVED: Transform data with safe fallbacks
    const transformedRefunds = refunds.map((refund) => ({
      id: refund.id,
      orderId: refund.orderId,
      amount: Number(refund.amount),
      reason: refund.reason || "",
      refundType: refund.refundType,
      status: refund.status,
      stripeRefundId: refund.stripeRefundId || "",
      createdAt: refund.createdAt,
      updatedAt: refund.updatedAt,
      processedBy: refund.processedBy || "",
      processedAt: refund.processedAt,
      order: {
        orderId: refund.order.orderId,
        customerName: refund.order.customerName || "Unknown",
        customerEmail: refund.order.customerEmail || "Unknown",
        totalAmount: Number(refund.order.totalAmount),
        paymentStatus: refund.order.paymentStatus,
        status: refund.order.status,
        createdAt: refund.order.createdAt,
      },
    }));

    return NextResponse.json({
      refunds: transformedRefunds,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
      summary: {
        totalRefunds: totalCount,
        totalRefundAmount:
          Math.round(
            allRefundsForSummary.reduce((sum, r) => sum + Number(r.amount), 0) *
              100
          ) / 100,
        averageRefundAmount:
          totalCount > 0
            ? Math.round(
                (allRefundsForSummary.reduce(
                  (sum, r) => sum + Number(r.amount),
                  0
                ) /
                  totalCount) *
                  100
              ) / 100
            : 0,
        statusCounts: {
          processing: allRefundsForSummary.filter(
            (r) => r.status === "PROCESSING"
          ).length,
          completed: allRefundsForSummary.filter(
            (r) => r.status === "COMPLETED"
          ).length,
          failed: allRefundsForSummary.filter((r) => r.status === "FAILED")
            .length,
          cancelled: allRefundsForSummary.filter(
            (r) => r.status === "CANCELLED"
          ).length,
        },
        refundTypeCounts: {
          partial: allRefundsForSummary.filter(
            (r) => r.refundType === "PARTIAL"
          ).length,
          full: allRefundsForSummary.filter((r) => r.refundType === "FULL")
            .length,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching refunds:", {
      error: error,
      adminId: adminUser?.id,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch refunds",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/refunds
 * ADMIN-ONLY: Updates refund status or details.
 */
export async function PATCH(request: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { refundId, status, reason } = await request.json();

    if (!refundId) {
      return NextResponse.json(
        { error: "Refund ID is required" },
        { status: 400 }
      );
    }

    if (status && !VALID_REFUND_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid refund status. Must be one of: ${VALID_REFUND_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existingRefund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: {
          select: { id: true, orderId: true, paymentStatus: true },
        },
      },
    });

    if (!existingRefund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    // ✅ ADDED: Business logic validation
    if (existingRefund.status === "COMPLETED" && status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot cancel a completed refund" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (reason !== undefined) updateData.reason = reason.trim();

    const updatedRefund = await prisma.refund.update({
      where: { id: refundId },
      data: updateData,
      include: {
        order: {
          select: {
            orderId: true,
            customerName: true,
            customerEmail: true,
            totalAmount: true,
            paymentStatus: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      refund: updatedRefund,
      message: "Refund updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating refund:", {
      error: error,
      adminId: adminUser?.id,
    });

    return NextResponse.json(
      {
        error: "Failed to update refund",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      },
      { status: 500 }
    );
  }
}
