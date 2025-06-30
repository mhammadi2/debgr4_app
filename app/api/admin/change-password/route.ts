import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const session = await getAuthSession();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword)
      return NextResponse.json(
        { error: "Both passwords required" },
        { status: 400 }
      );
    if (newPassword.length < 6)
      return NextResponse.json(
        { error: "Password too short" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      return NextResponse.json(
        { error: "Current password incorrect" },
        { status: 400 }
      );

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Password changed" });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
