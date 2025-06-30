// app/api/admin/stats/route.ts (Fixed for your schema)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log("Fetching admin stats...");

    const [totalProducts, totalOrders, totalCustomers, monthlyOrdersData] =
      await Promise.all([
        // Count total products
        prisma.product.count(),

        // Count total orders
        prisma.order.count(),

        // Count total customers (users with USER role)
        prisma.user.count({ where: { role: "USER" } }),

        // Get monthly orders data with correct field name and enum values
        prisma.order.findMany({
          where: {
            createdAt: { gte: startOfMonth },
            // Only count completed/successful orders for revenue
            status: {
              in: ["DELIVERED", "SHIPPED"], // Using your actual enum values
            },
          },
          select: {
            totalAmount: true, // Using correct field name from schema
            status: true,
          },
        }),
      ]);

    // Calculate monthly revenue using totalAmount field
    const monthlyRevenue = monthlyOrdersData.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );

    const stats = {
      totalProducts,
      totalOrders,
      totalCustomers,
      monthlyRevenue,
    };

    console.log("Stats calculated successfully:", stats);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
