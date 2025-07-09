// File: app/api/admin/orders/recent/route.ts (Revised & Aligned)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Using the consistent db import
// ✅ ALIGNED: Import the specialized helper for protecting admin routes.
import { requireAdmin } from "@/lib/auth";

/**
 * GET: Fetches the 5 most recent orders for the admin dashboard.
 * This is a protected route, accessible only by administrators.
 */
export async function GET() {
  try {
    // ✨ REFACTORED: Use the `requireAdmin` helper to centralize authorization.
    // This one line replaces the manual session fetching and role checking.
    const user = await requireAdmin();

    // If the check fails, `requireAdmin` returns a NextResponse. We just pass it along.
    if (user instanceof NextResponse) {
      return user; // Returns a 403 Forbidden response
    }

    // --- If authorization passes, proceed ---

    // Database Query: Fetch the recent orders.
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      // Including user details (with a select) is great for the dashboard UI.
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Success Response: Return the fetched data.
    return NextResponse.json(recentOrders);
  } catch (error) {
    // Error Handling: Catch potential database or other unexpected errors.
    console.error("API Error: Failed to fetch recent orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
