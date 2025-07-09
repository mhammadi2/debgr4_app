import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireAdmin } from "@/lib/auth";
import { compare, hash } from "bcryptjs"; // Make sure to use the same bcrypt library as in auth.ts

export async function POST(req: Request) {
  try {
    const adminUser = await requireAdmin();

    // Check if adminUser is a NextResponse (error case)
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    const data = await req.json();
    const { currentPassword, newPassword } = data;

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // For admin user - get the admin model with the username
    // Important: We're using the email field from adminUser which actually contains username for admin users
    const admin = await prisma.admin.findUnique({
      where: { username: adminUser.email },
    });

    if (!admin) {
      console.error("Admin not found:", adminUser);
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordValid = await compare(currentPassword, admin.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password - use the same settings as in your seed.ts or auth setup
    // Most NextAuth.js setups use 12 rounds
    const newPasswordHash = await hash(newPassword, 12);

    // Update password
    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
