// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // <-- same alias you use elsewhere
import { requireAdmin } from "@/lib/auth"; // <-- the correct helper
import { UserRole, UserStatus } from "@prisma/client";

/* ──────────────────────────────────────────────────────────────
   GET /api/admin/users
   Returns a list of non-admin users for the admin dashboard.
   Access: ADMIN only
   ────────────────────────────────────────────────────────────── */
export async function GET(_req: NextRequest) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck; // 401 / 403 already set

  try {
    const users = await prisma.user.findMany({
      where: { role: { not: UserRole.ADMIN } }, // hide fellow admins
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err: any) {
    console.error("❌ /api/admin/users GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users", message: err.message },
      { status: 500 }
    );
  }
}

/* ──────────────────────────────────────────────────────────────
   PUT /api/admin/users
   Updates a user’s role or status (non-admin accounts only)
   Body: { id: string, role: UserRole, status: UserStatus }
   Access: ADMIN only
   ────────────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest) {
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) return authCheck;

  try {
    const { id, role, status } = (await req.json()) as {
      id?: string;
      role?: UserRole;
      status?: UserStatus;
    };

    if (!id || !role || !status) {
      return NextResponse.json(
        { error: "Missing required fields: id, role, status" },
        { status: 400 }
      );
    }

    /* Prevent an admin from editing them-selves */
    if (id === authCheck.user.id) {
      return NextResponse.json(
        { error: "You cannot modify your own account" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    /* Never allow this endpoint to create or edit ADMIN accounts */
    if (existing.role === UserRole.ADMIN || role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin roles cannot be modified from this panel" },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role, status },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("❌ /api/admin/users PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update user", message: err.message },
      { status: 500 }
    );
  }
}
