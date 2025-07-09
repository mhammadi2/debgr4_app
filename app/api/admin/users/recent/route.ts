// File: app/api/admin/users/recent/route.ts (Revised & Aligned)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Using the consistent db import
// ✅ ALIGNED: Import the specialized helper for protecting admin routes.
import { requireAdmin } from "@/lib/auth";

/**
 * GET: Fetches the 5 most recent users for the admin dashboard.
 * This is a protected route, accessible only by administrators.
 */
export async function GET() {
  try {
    // ✨ REFACTORED: Use the `requireAdmin` helper.
    // This single line handles both fetching the session AND returning a 403
    // error response if the user is not an authenticated admin.
    const user = await requireAdmin();

    // The helper returns a NextResponse on failure, so we check for that.
    if (user instanceof NextResponse) {
      return user; // Return the 403 Forbidden response
    }

    // --- If authorization passes, proceed with the main logic ---

    // Database Query: Fetch the 5 most recently created users.
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      // This `select` clause is a great security and performance practice.
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    // Success Response: Return the fetched user data.
    return NextResponse.json(recentUsers);
  } catch (error) {
    // Error Handling: Catch potential database or other unexpected errors.
    console.error("API Error: Failed to fetch recent users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
