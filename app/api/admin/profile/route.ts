import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const session = await getAuthSession();

    const user = await prisma.user.findUnique({
      where: { id: session!.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const session = await getAuthSession();
    const body = (await req.json()) as { name: string; email: string };

    if (!body.name || !body.email)
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );

    // Check email uniqueness
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing && existing.id !== session!.user.id) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: session!.user.id },
      data: { name: body.name, email: body.email },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
