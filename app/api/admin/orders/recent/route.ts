// File: app/api/admin/orders/recent/route.ts (Corrected and Secured)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// ✅ CORRECTION: We only need `getAuth` from our auth library.
import { getAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * GET: Fetches the 5 most recent orders for the admin dashboard.
 */
export async function GET() {
  // ✅ 1. Authorization: Get the session and verify the user is an admin.
  // This is the correct way to protect an API route.
  const session = await getAuth();

  // If there's no session or the user is not an ADMIN, deny access.
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- If the check passes, the rest of the function can run ---
  try {
    // 2. Database Query: Fetch the recent orders.
    const recentOrders = await prisma.order.findMany({
      take: 5, // Limit to the 5 most recent orders
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
      include: {
        // Include related user details for a richer response
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 3. Success Response: Return the fetched data.
    return NextResponse.json(recentOrders);
  } catch (error) {
    // 4. Error Handling: Catch potential database errors.
    console.error("Failed to fetch recent orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
