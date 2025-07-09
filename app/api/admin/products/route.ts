import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

/* ── helper to serialise Decimal ───────────────────── */
const toJSON = (p: any) => ({
  ...p,
  price: parseFloat(p.price.toString()),
  createdAt: p.createdAt.toISOString(),
  updatedAt: p.updatedAt.toISOString(),
});

/* ====================================================
   GET  /api/admin/products
   ==================================================== */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products.map(toJSON));
}

/* ====================================================
   POST  /api/admin/products   (create)
   ==================================================== */
export async function POST(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";
  const priceStr = formData.get("price") as string;
  const stockStr = (formData.get("stock") as string) || "0";
  const category = formData.get("category") as string;
  const file = formData.get("file");

  /* basic validation (unchanged) … */
  if (!name?.trim() || !priceStr || !category?.trim()) {
    return NextResponse.json(
      { error: "Missing required fields: name, price, category" },
      { status: 400 }
    );
  }
  const price = parseFloat(priceStr);
  const stock = parseInt(stockStr, 10);
  if (isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Price / stock must be valid non-negative numbers" },
      { status: 400 }
    );
  }

  /* optional upload logic kept exactly as you had … */
  let imageUrl = (formData.get("imageUrl") as string) || "";
  if (file instanceof File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadUrl = new URL("/api/upload", request.url).toString();
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: fd,
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (!res.ok) throw new Error(await res.text());
      imageUrl = (await res.json()).imageUrl;
    } catch (e) {
      console.error("File upload error:", e);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      description: description.trim(),
      price,
      stock,
      category: category.trim(),
      imageUrl,
    },
  });

  return NextResponse.json(toJSON(product), { status: 201 });
}

/* ====================================================
   PUT  /api/admin/products   (update)
   ==================================================== */
export async function PUT(request: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const formData = await request.formData();
  const idStr = formData.get("id") as string;
  if (!idStr)
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  const id = parseInt(idStr, 10);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  /* build dataToUpdate (exactly your logic) */
  const dataToUpdate: any = {};
  if (formData.has("name"))
    dataToUpdate.name = formData.get("name")!.toString().trim();
  if (formData.has("description"))
    dataToUpdate.description = formData.get("description")!.toString().trim();
  if (formData.has("category"))
    dataToUpdate.category = formData.get("category")!.toString().trim();
  if (formData.has("price")) {
    const p = parseFloat(formData.get("price") as string);
    if (!isNaN(p) && p >= 0) dataToUpdate.price = p;
  }
  if (formData.has("stock")) {
    const s = parseInt(formData.get("stock") as string, 10);
    if (!isNaN(s) && s >= 0) dataToUpdate.stock = s;
  }

  /* optional file upload identical to your code … */
  const file = formData.get("file");
  if (file instanceof File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadUrl = new URL("/api/upload", request.url).toString();
      const res = await fetch(uploadUrl, {
        method: "POST",
        body: fd,
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (!res.ok) throw new Error(await res.text());
      dataToUpdate.imageUrl = (await res.json()).imageUrl;
    } catch (e) {
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      );
    }
  } else if (formData.get("keepExistingImage") === "true") {
    dataToUpdate.imageUrl = existing.imageUrl;
  } else if (formData.has("imageUrl")) {
    dataToUpdate.imageUrl = (formData.get("imageUrl") as string) || null;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: dataToUpdate,
  });

  return NextResponse.json(toJSON(updated));
}

/* ====================================================
   DELETE  /api/admin/products
   ==================================================== */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

  const { searchParams } = new URL(req.url);
  const idStr = searchParams.get("id");
  const force = searchParams.get("force") === "true";

  if (!idStr)
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  const id = parseInt(idStr, 10);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (force) {
    /* hard delete exactly as you coded, not returning product */
    const cnt = await prisma.orderItem.count({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      forceDeleted: true,
      removedOrderItems: cnt,
      message: `Product "${product.name}" permanently deleted`,
    });
  }

  /* safe path */
  const orderItemsCount = await prisma.orderItem.count({
    where: { productId: id },
  });
  if (orderItemsCount > 0) {
    const updated = await prisma.product.update({
      where: { id },
      data: { stock: 0 },
    });
    return NextResponse.json({
      success: true,
      markedOutOfStock: true,
      orderItemsCount,
      product: toJSON(updated),
    });
  } else {
    /* archive instead of hard delete */
    await prisma.product.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
    return NextResponse.json({
      success: true,
      archived: true,
      message: `Product "${product.name}" archived successfully`,
    });
  }
}
