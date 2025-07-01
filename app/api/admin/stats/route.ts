// File: app/api/admin/stats/route.ts (Corrected and Secured)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * GET: Fetches aggregate statistics for the admin dashboard.
 * This endpoint is protected and only accessible by admins.
 */
export async function GET() {
  // 1. Authorization: Secure the endpoint.
  const session = await getAuth();
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 2. Database Query: Fetch the required data.
    const userCount = await prisma.user.count();
    const orderCount = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: {
        // ✅ CORRECTION: Use the correct field name from your schema.
        // It is most likely `totalAmount`, not `total`.
        totalAmount: true,
      },
    });

    // 3. Success Response: Return the fetched statistics.
    return NextResponse.json({
      userCount,
      orderCount,
      // ✅ CORRECTION: Access the result using the same correct field name.
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    });
  } catch (error) {
    // 4. Error Handling
    console.error("Failed to fetch admin statistics:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
