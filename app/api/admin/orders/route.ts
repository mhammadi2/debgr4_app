// ------------------------------------------------------------
// app/api/admin/orders/route.ts
// ------------------------------------------------------------
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ← adjust the import path if needed

export const runtime = "nodejs";

/* ------------------------------------------------------------
   helpers
------------------------------------------------------------ */

function toInt(v: string | null, def = 0) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function buildWhere(params: URLSearchParams) {
  const search = params.get("search")?.trim();
  const status = params.get("status")?.toUpperCase();

  const where: any = {};

  if (search) {
    where.OR = [
      { orderId: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { customerPhone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  return where;
}

const defaultPageSize = 10;

/* ------------------------------------------------------------
   GET  – list orders with pagination
------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const pageSize = Math.max(
      1,
      toInt(searchParams.get("pageSize"), defaultPageSize)
    );
    const skip = (page - 1) * pageSize;
    const where = buildWhere(searchParams);

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
          orderItems: {
            include: {
              product: {
                select: { id: true, name: true, imageUrl: true, price: true },
              },
            },
          },
          shippingAddress: true, // relation name in current schema
          transactions: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),

      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount,
      },
    });
  } catch (err: any) {
    console.error("GET /api/admin/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------------------------------------
   PUT – update order status / paymentStatus
------------------------------------------------------------ */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: { include: { product: true } },
        shippingAddress: true,
        transactions: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/admin/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ------------------------------------------------------------
   DELETE – soft-delete (archive) an order
------------------------------------------------------------ */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const deleted = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ message: "Order cancelled", order: deleted });
  } catch (err: any) {
    console.error("DELETE /api/admin/orders error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
