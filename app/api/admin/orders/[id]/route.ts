import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
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
          orderBy: { createdAt: "desc" },
        },
        refunds: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const transformedOrder = {
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

    return NextResponse.json(transformedOrder);
  } catch (err: any) {
    console.error("GET /api/admin/orders/[id] error:", err);
    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}

// ✅ ADDED: PATCH method for updating order details
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { id } = params;
    const { status, paymentStatus, trackingNumber, adminNotes } =
      await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined)
      updateData.trackingNumber = trackingNumber.trim();
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes.trim();

    const updatedOrder = await prisma.order.update({
      where: { id },
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
      order: updatedOrder,
      message: "Order updated successfully",
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/orders/[id] error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to update order",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
