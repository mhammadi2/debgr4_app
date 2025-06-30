// In: app/api/orders/route.ts (Corrected)

import { NextResponse } from "next/server";
// --- FIX: Import your custom `getSession` function, NOT `auth` ---
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Corrected to match your project setup

// GET handler to fetch orders for the currently authenticated user
export async function GET(request: Request) {
  try {
    // --- FIX: Use your `getSession` function to get the user session ---
    const session = await getSession();

    // Security Check: If there's no user in the session, deny access.
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({
          error: "Unauthorized: You must be logged in to view orders.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch orders from the database that belong to the logged-in user.
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id, // Filter orders by the user's ID
      },
      include: {
        // Include related order items to show what was purchased
        items: {
          include: {
            product: true, // Include product details for each item
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Show the most recent orders first
      },
    });

    // Return the fetched orders as a JSON response.
    return NextResponse.json(orders);
  } catch (error) {
    console.error("API Orders GET Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
