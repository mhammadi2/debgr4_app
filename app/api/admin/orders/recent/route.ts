// File: app/api/admin/orders/recent/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Secure the route: ensure the user is an admin
    await requireAdmin();

    const orders = await prisma.order.findMany({
      take: 5, // Get the 5 most recent orders
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          // Include related user data
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    // Return a generic server error
    return new NextResponse(
      JSON.stringify({
        error: "An error occurred while fetching recent orders.",
      }),
      { status: 500 }
    );
  }
}
