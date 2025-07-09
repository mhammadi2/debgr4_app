// app/api/orders/[orderId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

interface Ctx {
  params: { orderId: string };
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  /* 1️⃣  Respect Next.js requirement: await params */
  const { orderId: param } = await Promise.resolve(ctx.params);

  if (!param) {
    return NextResponse.json(
      { error: "orderId is required in the route" },
      { status: 400 }
    );
  }

  try {
    const session = await getAuthSession();

    console.log("🔍 Order lookup:", {
      orderId: param,
      hasSession: !!session,
      userId: session?.user?.id,
    });

    /* 2️⃣  Decide which column to query */
    const where = param.startsWith("ORD-")
      ? { orderId: param } // friendly public id
      : { id: param }; // database primary key

    /* 3️⃣  Fetch the order */
    const order = await prisma.order.findFirst({
      where,
      include: {
        orderItems: { include: { product: true } },
        shippingAddress: true,
      },
    });

    if (!order) {
      console.log("❌ Order not found in database");
      return NextResponse.json(
        {
          error: "Order not found",
          details: "This order does not exist in our system.",
        },
        { status: 404 }
      );
    }

    /* 4️⃣  Authorisation checks */
    const isAdmin = session?.user?.role === "ADMIN";
    const isOwner = session?.user?.id && order.userId === session.user.id;
    const isGuest = !order.userId;

    if (!(isAdmin || isOwner || isGuest)) {
      console.log("❌ Access denied");
      return NextResponse.json(
        {
          error: "Order not found",
          details: "You don't have permission to view this order.",
        },
        { status: 404 }
      );
    }

    console.log("✅ Access granted, returning order");
    return NextResponse.json(order);
  } catch (err: any) {
    console.error(`API error fetching order "${param}":`, err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
