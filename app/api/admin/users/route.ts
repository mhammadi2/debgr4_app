// File: app/api/admin/users/route.ts (Corrected and Aligned with Schema)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth } from "@/lib/auth";
import { UserRole, UserStatus } from "@prisma/client";

/**
 * GET: Fetch all users.
 * This function is called to populate the user management panel.
 */
export async function GET() {
  const session = await getAuth();

  // ✅ CORRECTION: Simplified authorization check.
  // The logic now correctly checks if the user's role is exactly `ADMIN`.
  if (session?.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: "Forbidden: Requires admin access." },
      { status: 403 }
    );
  }

  try {
    // ✅ IMPROVEMENT: The query now specifically excludes other admins from the list.
    // This prevents admins from appearing in the user management UI.
    const users = await prisma.user.findMany({
      where: {
        role: { not: UserRole.ADMIN },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT: Update a user's role or status.
 */
export async function PUT(request: Request) {
  const session = await getAuth();

  // ✅ CORRECTION: Simplified authorization check.
  if (session?.user.role !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: "Forbidden: Requires admin access." },
      { status: 403 }
    );
  }

  try {
    const {
      id,
      role,
      status,
    }: { id: string; role: UserRole; status: UserStatus } =
      await request.json();

    if (!id || !role || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id, role, status" },
        { status: 400 }
      );
    }

    // Security: Prevent an admin from modifying their own account through this panel.
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account." },
        { status: 403 }
      );
    }

    const userToUpdate = await prisma.user.findUnique({ where: { id } });
    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // ✅ CORRECTION: Simplified and more secure role hierarchy logic.
    // This rule prevents an ADMIN from promoting a regular USER to ADMIN status.
    // It also prevents the modification of any account that is already an ADMIN.
    if (userToUpdate.role === UserRole.ADMIN || role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: "This panel cannot be used to manage admin roles." },
        { status: 403 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role, status },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
