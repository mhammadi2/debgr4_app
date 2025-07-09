import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuth, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const adminUser = await requireAdmin();

    // Check if adminUser is a NextResponse (error case)
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    // At this point we have a valid admin user
    const admin = await prisma.admin.findUnique({
      where: { id: adminUser.id },
      select: {
        id: true,
        username: true,
        role: true,
        // Don't include passwordHash for security
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: admin.id,
      name: admin.username, // Using username as name
      email: admin.username, // Since you're using username instead of email
      role: admin.role,
    });
  } catch (error) {
    console.error("Admin profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const adminUser = await requireAdmin();

    // Check if adminUser is a NextResponse (error case)
    if (adminUser instanceof NextResponse) {
      return adminUser;
    }

    const data = await req.json();
    const { name, email } = data;

    // For admins, you might want to update username instead of name/email
    // Adjust this based on your admin schema
    const admin = await prisma.admin.update({
      where: { id: adminUser.id },
      data: {
        username: email, // Using email as username since that's what you're displaying
      },
      select: {
        id: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json({
      id: admin.id,
      name: admin.username,
      email: admin.username,
      role: admin.role,
    });
  } catch (error) {
    console.error("Update admin profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
