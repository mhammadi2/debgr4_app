// File: app/api/admin/users/recent/route.ts (New File)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { UserRole } from "@prisma/client";

/**
 * GET: Fetches the 5 most recent users for the admin dashboard.
 * This is a protected route, accessible only by administrators.
 */
export async function GET() {
  // 1. Authorization: Secure the endpoint by checking for an admin session.
  const session = await getAuth();

  // If the user is not an admin, block access.
  if (session?.user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- If authorization passes, proceed ---
  try {
    // 2. Database Query: Fetch the 5 most recently created users.
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc", // Assuming your User model has a `createdAt` field
      },
      // Select only the fields necessary for the dashboard to avoid sending
      // sensitive data like password hashes.
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    // 3. Success Response: Return the fetched user data.
    return NextResponse.json(recentUsers);
  } catch (error) {
    // 4. Error Handling: Catch potential database errors.
    console.error("Failed to fetch recent users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
