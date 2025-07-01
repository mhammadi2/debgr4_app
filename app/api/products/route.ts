// File: /app/api/admin/products/route.ts (Revised and Secured)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Assuming this is the correct path to your Prisma client
import { requireAdmin } from "@/lib/auth"; // ✅ 1. IMPORT our authentication guard
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // Ensure you have installed uuid: npm i uuid @types/uuid

// This helper function is well-written and can remain as is.
async function ensureUploadDirExists() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
  return uploadDir;
}

// This helper function is also great. No changes needed.
async function saveImageToServer(file: File): Promise<string> {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const uploadDir = await ensureUploadDirExists();
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/${fileName}`; // This relative path is correct for the public directory
}

/**
 * GET /api/admin/products
 * PUBLIC: Fetches all products. This route remains unprotected
 * so that customers can view the product list.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * ADMIN-ONLY: Creates a new product.
 */
export async function POST(request: NextRequest) {
  // ✅ 2. PROTECT THE ROUTE
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser; // If not an admin, return the 403 Forbidden response
  }

  // If we get here, the user is a confirmed admin.
  try {
    const formData = await request.formData();
    // ... rest of your existing logic is good ...
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveImageToServer(imageFile);
    }

    const newProduct = await prisma.product.create({
      data: { name, description: description || "", price, imageUrl, category },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
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
  // ✅ 2. PROTECT THE ROUTE
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser; // Deny access if not admin
  }

  try {
    const formData = await request.formData();
    // ... your logic is solid, no changes needed here ...
    const id = formData.get("id") as string;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (formData.has("name"))
      dataToUpdate.name = formData.get("name") as string;
    if (formData.has("description"))
      dataToUpdate.description = formData.get("description") as string;
    if (formData.has("category"))
      dataToUpdate.category = formData.get("category") as string;
    if (formData.has("price")) {
      const price = parseFloat(formData.get("price") as string);
      if (!isNaN(price) && price >= 0) dataToUpdate.price = price;
    }

    const imageFile = formData.get("image") as File | null;
    if (imageFile && imageFile.size > 0) {
      dataToUpdate.imageUrl = await saveImageToServer(imageFile);
    } else if (formData.get("keepExistingImage") !== "true") {
      dataToUpdate.imageUrl = null;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: dataToUpdate,
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PUT /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products
 * ADMIN-ONLY: Deletes a product.
 */
export async function DELETE(request: NextRequest) {
  // ✅ 2. PROTECT THE ROUTE
  const adminUser = await requireAdmin();
  if (adminUser instanceof NextResponse) {
    return adminUser; // Deny access if not admin
  }

  try {
    const { id } = await request.json();
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/products Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
