import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/* ------------------------------------------------------------
   helpers
------------------------------------------------------------ */

function toInt(v: string | null, def = 0) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function buildWhere(params: URLSearchParams) {
  const search = params.get("search")?.trim();
  const status = params.get("status")?.toLowerCase();
  const paymentStatus = params.get("paymentStatus")?.toLowerCase(); // ✅ ADDED: Payment status filter

  const where: any = {};

  if (search) {
    where.OR = [
      { orderId: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && status !== "all") {
    where.status = status.toUpperCase();
  }

  // ✅ ADDED: Payment status filtering
  if (paymentStatus && paymentStatus !== "all") {
    where.paymentStatus = paymentStatus.toUpperCase();
  }

  return where;
}

const defaultPageSize = 10;

/* ------------------------------------------------------------
   GET  – list orders with pagination
------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.max(
      1,
      Math.min(100, toInt(searchParams.get("limit"), defaultPageSize))
    );
    const skip = (page - 1) * limit;
    const where = buildWhere(searchParams);

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true, price: true },
              },
            },
          },
          shippingAddress: true,
          transactions: {
            select: {
              id: true,
              amount: true,
              status: true,
              createdAt: true,
              stripePaymentId: true,
            },
          },
          refunds: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),

      prisma.order.count({ where }),
    ]);

    // ✅ IMPROVED: Transform data with better error handling
    const transformedOrders = orders.map((order) => {
      try {
        return {
          id: order.id,
          orderId: order.orderId,
          customerName: order.customerName || "Unknown",
          customerEmail: order.customerEmail || "Unknown",
          customerPhone: order.customerPhone || "",
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          trackingNumber: order.trackingNumber || "",
          adminNotes: order.adminNotes || "",
          stripePaymentIntentId: order.stripePaymentIntentId || "",
          orderItems: order.orderItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            price: Number(item.price),
            product: {
              id: item.product.id,
              name: item.product.name || "Unknown Product",
              imageUrl: item.product.imageUrl || "",
            },
          })),
          address: order.shippingAddress
            ? {
                id: order.shippingAddress.id,
                street: order.shippingAddress.street || "",
                city: order.shippingAddress.city || "",
                state: order.shippingAddress.state || "",
                zipCode: order.shippingAddress.zipCode || "",
                country: order.shippingAddress.country || "",
              }
            : null,
          refunds: order.refunds.map((refund) => ({
            id: refund.id,
            amount: Number(refund.amount),
            reason: refund.reason || "",
            refundType: refund.refundType,
            status: refund.status,
            createdAt: refund.createdAt,
            stripeRefundId: refund.stripeRefundId || "",
          })),
          transactions: order.transactions.map((transaction) => ({
            id: transaction.id,
            amount: Number(transaction.amount),
            status: transaction.status,
            createdAt: transaction.createdAt,
            stripePaymentId: transaction.stripePaymentId || "",
          })),
        };
      } catch (transformError) {
        console.error("Error transforming order:", order.id, transformError);
        // ✅ ADDED: Return a minimal safe version if transformation fails
        return {
          id: order.id,
          orderId: order.orderId,
          customerName: order.customerName || "Unknown",
          customerEmail: order.customerEmail || "Unknown",
          customerPhone: order.customerPhone || "",
          status: order.status,
          paymentStatus: order.paymentStatus,
          totalAmount: Number(order.totalAmount),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          trackingNumber: "",
          adminNotes: "",
          stripePaymentIntentId: "",
          orderItems: [],
          address: null,
          refunds: [],
          transactions: [],
        };
      }
    });

    // ✅ IMPROVED: Get all orders for accurate summary (without pagination)
    const allOrdersForSummary = await prisma.order.findMany({
      where,
      select: { status: true, paymentStatus: true },
    });

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
      summary: {
        totalOrders: totalCount,
        statusCounts: {
          pending: allOrdersForSummary.filter((o) => o.status === "PENDING")
            .length,
          processing: allOrdersForSummary.filter(
            (o) => o.status === "PROCESSING"
          ).length,
          shipped: allOrdersForSummary.filter((o) => o.status === "SHIPPED")
            .length,
          delivered: allOrdersForSummary.filter((o) => o.status === "DELIVERED")
            .length,
          cancelled: allOrdersForSummary.filter((o) => o.status === "CANCELLED")
            .length,
        },
        paymentStatusCounts: {
          pending: allOrdersForSummary.filter(
            (o) => o.paymentStatus === "PENDING"
          ).length,
          paid: allOrdersForSummary.filter((o) => o.paymentStatus === "PAID")
            .length,
          failed: allOrdersForSummary.filter(
            (o) => o.paymentStatus === "FAILED"
          ).length,
          refunded: allOrdersForSummary.filter(
            (o) => o.paymentStatus === "REFUNDED"
          ).length,
          partiallyRefunded: allOrdersForSummary.filter(
            (o) => o.paymentStatus === "PARTIALLY_REFUNDED"
          ).length,
        },
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch orders",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   PATCH – update order status / tracking / notes
------------------------------------------------------------ */
export async function PATCH(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const body = await req.json();
    const { orderId, status, paymentStatus, trackingNumber, adminNotes } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // ✅ IMPROVED: Validate status values
    const validOrderStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    const validPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];

    if (status && !validOrderStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid order status. Must be one of: ${validOrderStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        {
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // ✅ IMPROVED: Check if order exists first
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, paymentStatus: true, adminNotes: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ ADDED: Business logic validation
    if (
      status === "CANCELLED" &&
      (existingOrder.status === "SHIPPED" ||
        existingOrder.status === "DELIVERED")
    ) {
      return NextResponse.json(
        { error: "Cannot cancel orders that have been shipped or delivered" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber.trim();

    // ✅ IMPROVED: Append to existing admin notes instead of replacing
    if (adminNotes !== undefined) {
      const currentNotes = existingOrder.adminNotes || "";
      const newNote = `[${new Date().toISOString()}] ${adminNotes.trim()}`;
      updateData.adminNotes = currentNotes
        ? `${currentNotes}\n${newNote}`
        : newNote;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        user: {
          select: { name: true, email: true, phone: true },
        },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
        shippingAddress: true,
        transactions: true,
        refunds: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: "Order updated successfully",
    });
  } catch (err: any) {
    console.error("PATCH /api/admin/orders error:", err);

    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to update order",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   PUT – update order status / paymentStatus (keep for backward compatibility)
------------------------------------------------------------ */
export async function PUT(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const body = await req.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // ✅ IMPROVED: Validate status values
    const validOrderStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    const validPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
      "PARTIALLY_REFUNDED",
    ];

    if (status && !validOrderStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid order status. Must be one of: ${validOrderStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        {
          error: `Invalid payment status. Must be one of: ${validPaymentStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, imageUrl: true, price: true },
            },
          },
        },
        shippingAddress: true,
        transactions: true,
        refunds: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: "Order updated successfully",
    });
  } catch (err: any) {
    console.error("PUT /api/admin/orders error:", err);

    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to update order",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------
   DELETE – soft-delete (archive) an order
------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    // ✅ IMPROVED: Check if order exists and can be cancelled
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true, paymentStatus: true, adminNotes: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ ADDED: Prevent cancellation of already processed orders
    if (
      existingOrder.status === "SHIPPED" ||
      existingOrder.status === "DELIVERED"
    ) {
      return NextResponse.json(
        { error: "Cannot cancel orders that have been shipped or delivered" },
        { status: 400 }
      );
    }

    // ✅ IMPROVED: Better admin notes handling
    const currentNotes = existingOrder.adminNotes || "";
    const cancellationNote = `[${new Date().toISOString()}] Order cancelled by admin`;
    const updatedNotes = currentNotes
      ? `${currentNotes}\n${cancellationNote}`
      : cancellationNote;

    const deleted = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        adminNotes: updatedNotes,
      },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { select: { id: true, quantity: true, price: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
      order: deleted,
    });
  } catch (err: any) {
    console.error("DELETE /api/admin/orders error:", err);

    if (err.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to cancel order",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
