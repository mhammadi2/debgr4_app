import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma"; // ✅ FIXED: Using correct import
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

// ✅ Define schema for input validation using Zod and the Prisma enum
const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

/**
 * PUT: Updates the status of a specific order.
 * Protected route, accessible only by administrators.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ FIXED: orderId → id
) {
  try {
    // ✅ Use centralized authorization helper
    const adminUser = await requireAdmin();
    if (adminUser instanceof NextResponse) return adminUser;

    const { id } = params; // ✅ FIXED: Using id instead of orderId

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ✅ Safely parse and validate the request body using Zod schema
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { status } = validation.data;

    // ✅ Check if order exists first
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ Business logic validation
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

    // ✅ Update the order in the database
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: status,
        // ✅ Add timestamp for status updates
        adminNotes:
          existingOrder.status !== status
            ? `Status changed from ${existingOrder.status} to ${status} at ${new Date().toISOString()}`
            : undefined,
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { name: true, price: true },
            },
          },
        },
        shippingAddress: true,
      },
    });

    // ✅ Optional: Send notification emails (implement if needed)
    try {
      if (status === "SHIPPED" && updatedOrder.user?.email) {
        // Only send if you have email functionality implemented
        // await sendShippingConfirmationEmail(updatedOrder, updatedOrder.user);
        console.log(
          `Order ${updatedOrder.orderId} marked as shipped for ${updatedOrder.user.email}`
        );
      }
    } catch (emailError) {
      console.error("Failed to send notification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error: any) {
    console.error("API Error: Failed to update order status:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Failed to update order status",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Fetches a specific order for admin viewing.
 * Protected route, accessible only by administrators.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // ✅ FIXED: orderId → id
) {
  try {
    // ✅ Use centralized authorization helper
    const adminUser = await requireAdmin();
    if (adminUser instanceof NextResponse) return adminUser;

    const { id } = params; // ✅ FIXED: Using id instead of orderId

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // ✅ Fetch the order from the database
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

    // ✅ Transform the order data consistently
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
  } catch (error: any) {
    console.error("API Error: Failed to fetch order:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch order",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
