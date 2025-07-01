// File: /app/api/admin/products/route.ts (Revised and Aligned)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Using the centralized prisma client from /lib/db.ts
import { requireAdmin } from "@/lib/auth"; // ✅ Correctly importing the auth guard

// NOTE: This file now assumes you have a separate, functioning `/api/upload` endpoint
// that can handle file uploads and is also protected by `requireAdmin`.

/**
 * GET /api/admin/products
 * ADMIN-ONLY: Fetches a list of products for the admin dashboard.
 * Supports filtering by search term and category.
 */
export async function GET(req: NextRequest) {
  // ✅ --- CORRECT AUTHENTICATION GUARD ---
  // We call requireAdmin and check if it returned a NextResponse (the error case).
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser; // Return the 403 Forbidden response immediately.
  }

  try {
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
    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("GET /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * ADMIN-ONLY: Creates a new product.
 */
export async function POST(request: NextRequest) {
  // ✅ --- CORRECT AUTHENTICATION GUARD ---
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const priceStr = formData.get("price") as string;
    const stockStr = (formData.get("stock") as string) || "0";
    const category = formData.get("category") as string;
    const file = formData.get("file");

    if (!name || !priceStr || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, and category" },
        { status: 400 }
      );
    }
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);
    if (isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { error: "Price and stock must be valid numbers" },
        { status: 400 }
      );
    }

    let imageUrl = (formData.get("imageUrl") as string) || ""; // Default to existing URL if passed
    if (file instanceof File) {
      // Delegate to the upload service
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const uploadUrl = new URL("/api/upload", request.url).toString();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const uploadData = await uploadRes.json();
      imageUrl = uploadData.imageUrl;
    }

    const product = await prisma.product.create({
      data: { name, description, price, stock, category, imageUrl },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products
 * ADMIN-ONLY: Updates an existing product.
 */
export async function PUT(request: NextRequest) {
  // ✅ --- CORRECT AUTHENTICATION GUARD ---
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const formData = await request.formData();
    const idStr = formData.get("id") as string;
    if (!idStr) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Build update data object
    const dataToUpdate: any = {};
    if (formData.has("name"))
      dataToUpdate.name = formData.get("name") as string;
    if (formData.has("description"))
      dataToUpdate.description = formData.get("description") as string;
    if (formData.has("category"))
      dataToUpdate.category = formData.get("category") as string;
    if (formData.has("price"))
      dataToUpdate.price = parseFloat(formData.get("price") as string);
    if (formData.has("stock"))
      dataToUpdate.stock = parseInt(formData.get("stock") as string, 10);

    const file = formData.get("file");
    if (file instanceof File) {
      // Delegate to upload service for new file
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      const uploadUrl = new URL("/api/upload", request.url).toString();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        body: uploadFormData,
        headers: { cookie: request.headers.get("cookie") || "" },
      });
      if (!uploadRes.ok) throw new Error(await uploadRes.text());
      const uploadData = await uploadRes.json();
      dataToUpdate.imageUrl = uploadData.imageUrl;
    } else if (formData.get("keepExistingImage") === "true") {
      dataToUpdate.imageUrl = product.imageUrl;
    } else {
      dataToUpdate.imageUrl = (formData.get("imageUrl") as string) || null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error("PUT /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * ADMIN-ONLY: Deletes a product or marks it as out of stock.
 */
export async function DELETE(req: NextRequest) {
  // ✅ --- CORRECT AUTHENTICATION GUARD ---
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser;
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Your excellent delete/archive logic is preserved here
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId },
    });
    if (orderItemsCount > 0) {
      // Product is in use, so we archive it by setting stock to 0 instead of deleting.
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { stock: 0 },
      });
      return NextResponse.json({
        success: true,
        message: `Product is in ${orderItemsCount} order(s). Marked as out of stock instead of deleting.`,
        product: updated,
      });
    } else {
      // No orders contain this product, so we can safely delete it.
      const deleted = await prisma.product.delete({ where: { id: productId } });
      return NextResponse.json({ success: true, product: deleted });
    }
  } catch (error: any) {
    console.error("DELETE /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
