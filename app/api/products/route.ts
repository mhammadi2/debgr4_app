import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const toJSON = (p: any) => ({
  ...p,
  price: parseFloat(p.price.toString()),
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
});

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products.map(toJSON));
  } catch (err) {
    console.error("GET /api/products", err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
