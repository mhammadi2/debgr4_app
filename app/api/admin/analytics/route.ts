import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";

/* Decimal → number helper */
const toNum = (v: Prisma.Decimal | number | null) =>
  v ? (v instanceof Prisma.Decimal ? v.toNumber() : v) : 0;

export async function GET(_req: NextRequest) {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;

  try {
    /* ── 1. Aggregates ─────────────────────────────── */
    const [
      revenueAgg,
      orderAgg,
      newCustomerAgg,
      revenueByMonthRaw,
      topProductsRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID" },
      }),

      prisma.order.aggregate({ _count: { _all: true } }),

      prisma.user.aggregate({
        _count: { _all: true },
        where: {
          role: "USER",
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.$queryRaw<{ monthlabel: string; revenue: number }[]>`SELECT
          to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS monthLabel,
          SUM("totalAmount")::numeric                          AS revenue
        FROM "orders"
        WHERE "paymentStatus" = 'PAID'
        GROUP BY 1
        ORDER BY 1`,

      /* single query returns name + qty ⇒ no follow-up query needed */
      prisma.$queryRaw<
        { name: string; qty: number }[]
      >`SELECT p."name"                       AS name,
               SUM(oi."quantity")::int        AS qty
        FROM "order_items" oi
        JOIN "products" p ON p."id" = oi."productId"
        GROUP BY 1
        ORDER BY qty DESC
        LIMIT 5`,
    ]);

    /* ── 2. Shape response ─────────────────────────── */
    return NextResponse.json({
      totalRevenue: toNum(revenueAgg._sum.totalAmount),
      totalSales: orderAgg._count._all,
      newCustomers: newCustomerAgg._count._all,
      revenueByMonth: revenueByMonthRaw.map((r) => ({
        month: r.monthlabel,
        revenue: toNum(r.revenue),
      })),
      topProducts: topProductsRaw, // already { name, qty }
    });
  } catch (err: any) {
    console.error("❌ /api/admin/analytics error:", err);
    return NextResponse.json(
      { error: "Failed to load analytics", message: err.message },
      { status: 500 }
    );
  }
}
