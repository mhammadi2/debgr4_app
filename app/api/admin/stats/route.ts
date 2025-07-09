// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/**
 * GET /api/admin/stats
 * Returns { totalUsers, totalOrders, totalRevenue }
 * Access: ADMIN only  (checked by `requireAdmin`)
 */
export async function GET(_req: NextRequest) {
  /* ──────────────────────────────────────────────
     1. Authorisation
     ────────────────────────────────────────────── */
  const authCheck = await requireAdmin();
  if (authCheck instanceof NextResponse) {
    // `requireAdmin` already built the 401/403 response for us
    return authCheck;
  }

  /* ──────────────────────────────────────────────
     2. Aggregate queries (run in parallel)
     ────────────────────────────────────────────── */
  try {
    const [totalUsers, totalOrders, revenueAgg] = await Promise.all([
      prisma.user.count(), // ← count EVERY user
      prisma.order.count(), // ← all orders, no filter
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: { paymentStatus: "PAID" }, // ← only paid orders contribute
      }),
    ]);

    // Prisma.Decimal → number (or string if you prefer)
    const totalRevenueRaw = revenueAgg._sum.totalAmount ?? 0;
    const totalRevenue =
      typeof totalRevenueRaw === "object" && "toNumber" in totalRevenueRaw
        ? (totalRevenueRaw as unknown as { toNumber: () => number }).toNumber()
        : Number(totalRevenueRaw);

    /* ────────────────────────────────────────────
       3. Success response
       ──────────────────────────────────────────── */
    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalRevenue,
    });
  } catch (err: any) {
    console.error("❌ /api/admin/stats error:", err);
    return NextResponse.json(
      { error: "Failed to fetch admin statistics", message: err.message },
      { status: 500 }
    );
  }
}
