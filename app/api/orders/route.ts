// File: app/api/orders/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Using your project's prisma path
import { requireUser } from "@/lib/auth"; // ✅ Importing our new helper

/**
 * GET: Fetches orders for the currently authenticated customer.
 * This route is now protected by the `requireUser` helper.
 */
export async function GET() {
  // ✅ This one line replaces all previous manual session and role checks.
  // It handles everything: no session, or a session for an ADMIN.
  const user = await requireUser();

  // If `requireUser` returned a NextResponse, it means auth failed.
  // We simply return that response immediately.
  if (user instanceof NextResponse) {
    return user;
  }

  // If we reach this point, `user` is guaranteed to be an authenticated customer.
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id, // We can safely use user.id
      },
      select: {
        id: true,
        orderId: true,
        createdAt: true,
        status: true,
        totalAmount: true, // Aligned with your schema
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET_ORDERS_API_ERROR]", error);
    return NextResponse.json(
      { error: "An internal error occurred while fetching your orders." },
      { status: 500 }
    );
  }
}
