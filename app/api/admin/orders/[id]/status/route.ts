// app/api/admin/orders/[id]/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Check authentication and authorization
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  try {
    const { status } = await request.json();

    // Validate the status is a valid OrderStatus
    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // If order is shipped, send notification email
    if (status === "SHIPPED") {
      // Send shipping confirmation email
      await sendShippingConfirmationEmail(id);
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

// Helper function to send shipping confirmation email
async function sendShippingConfirmationEmail(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        shippingAddress: true,
      },
    });

    if (!order) return;

    // Send email logic here (similar to previous implementation)
    // This would use nodemailer to send a shipping notification
  } catch (error) {
    console.error("Error sending shipping confirmation:", error);
  }
}
