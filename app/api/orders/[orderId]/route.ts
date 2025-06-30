// app/api/orders/[orderId]/route.ts (Revised for Security and Correctness)

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth"; // Correct, reusable import path for auth options

export async function GET(
  request: NextRequest, // The 'request' object is needed to resolve the params stream
  { params }: { params: { orderId: string } }
) {
  // --- FIX 1: Resolve the request stream before accessing params ---
  // This line is required in modern Next.js to prevent the 'sync-dynamic-apis' error.
  await request.text();

  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Users must be logged in to view any order.
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // --- FIX 2: Build a secure database query ---
    // This query object will be used to find the order.
    const whereClause: { orderId: string; customerEmail?: string } = {
      orderId: orderId,
    };

    // If the user is NOT an admin, we add a condition to the query
    // to ensure they can only access their own orders.
    if (session.user.role !== "admin") {
      whereClause.customerEmail = session.user.email;
    }

    // Now, execute the single, secure query.
    const order = await prisma.order.findFirst({
      where: whereClause, // The query is now conditional based on user role
      include: {
        shippingAddress: true,
        orderItems: true,
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // If the query returns nothing, it means the order doesn't exist OR the user
    // doesn't have permission to view it. We return a 404 in either case
    // to avoid leaking information about which order IDs exist.
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If we get here, the user is authorized. Return the order.
    return NextResponse.json(order);
  } catch (error) {
    console.error(`[ORDER_FETCH_ERROR] OrderID: ${params.orderId}`, error);
    return NextResponse.json(
      { error: "An internal error occurred while fetching the order." },
      { status: 500 }
    );
  }
}
