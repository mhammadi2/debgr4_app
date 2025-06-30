// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // Adjust path if needed
import { requireAdmin } from "@/lib/auth"; // Your auth middleware
import fs from "fs";
import path from "path";

// Create uploads directory if it doesn't exist
function ensureUploadsDirectory() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    console.log("Creating uploads directory:", uploadDir);
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// GET - List all products with optional filtering
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

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
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Product fetch error:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    // Ensure uploads directory exists
    ensureUploadsDirectory();

    // Log request headers for debugging
    console.log("Request headers:", {
      contentType: request.headers.get("content-type"),
    });

    const formData = await request.formData();
    console.log("Received form data keys:", Array.from(formData.keys()));

    // Extract text fields
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const priceStr = formData.get("price") as string;
    const stockStr = (formData.get("stock") as string) || "0";
    const category = formData.get("category") as string;

    // Extract file and check if it's actually a File object
    const file = formData.get("file");
    const isFile = file instanceof File;
    console.log(
      "File field:",
      isFile ? `File: ${(file as File).name}` : "Not a file"
    );

    // Handle potential existing imageUrl
    let existingImageUrl = (formData.get("imageUrl") as string) || "";

    // Validate required fields
    if (!name || !priceStr || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, price and category" },
        { status: 400 }
      );
    }

    // Parse numeric fields
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);

    if (isNaN(price)) {
      return NextResponse.json(
        { error: "Price must be a valid number" },
        { status: 400 }
      );
    }

    // Handle file upload if we have a file
    let imageUrl = existingImageUrl;

    if (isFile) {
      try {
        // Use existing upload endpoint
        const uploadFormData = new FormData();
        uploadFormData.append("file", file as File);

        const uploadUrl = new URL("/api/upload", request.url).toString();
        console.log("Uploading to:", uploadUrl);

        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: uploadFormData,
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed: ${errorText}`);
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }

        imageUrl = uploadData.imageUrl;
        console.log("Uploaded image:", imageUrl);
      } catch (uploadError: any) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl: imageUrl || "", // Match schema default
      },
    });

    console.log("Created product:", product);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product creation error:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT - Update existing product
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    // Ensure uploads directory exists
    ensureUploadsDirectory();

    const formData = await request.formData();

    // Extract text fields
    const idStr = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const priceStr = formData.get("price") as string;
    const stockStr = (formData.get("stock") as string) || "0";
    const category = formData.get("category") as string;

    // Extract file and check if it's actually a File object
    const file = formData.get("file");
    const isFile = file instanceof File;

    // Handle potential existing imageUrl
    let existingImageUrl = (formData.get("imageUrl") as string) || "";
    const keepExistingImage = formData.get("keepExistingImage") === "true";

    // Validate required fields
    if (!idStr || !name || !priceStr || !category) {
      return NextResponse.json(
        { error: "Missing required fields: id, name, price and category" },
        { status: 400 }
      );
    }

    // Parse numeric fields
    const id = parseInt(idStr, 10);
    const price = parseFloat(priceStr);
    const stock = parseInt(stockStr, 10);

    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Handle file upload if we have a file
    let imageUrl = existingImageUrl;

    if (isFile) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file as File);

        const uploadUrl = new URL("/api/upload", request.url).toString();
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: uploadFormData,
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed: ${errorText}`);
        }

        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error(uploadData.error || "Upload failed");
        }

        imageUrl = uploadData.imageUrl;
      } catch (uploadError: any) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Image upload failed: ${uploadError.message}` },
          { status: 500 }
        );
      }
    } else if (keepExistingImage && existingProduct.imageUrl) {
      // Keep existing image from database
      imageUrl = existingProduct.imageUrl;
    }

    // Update product in database
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        category,
        imageUrl: imageUrl || "", // Match schema default
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Product update error:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product (with handling for products in orders)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const force = searchParams.get("force") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    const productId = Number(id);

    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if there are any related order items
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      select: { id: true },
    });

    if (orderItems.length > 0) {
      if (force) {
        // Force delete: Remove all order items first, then product
        await prisma.orderItem.deleteMany({
          where: { productId },
        });

        const deleted = await prisma.product.delete({
          where: { id: productId },
        });

        return NextResponse.json({
          success: true,
          product: deleted,
          forceDeleted: true,
          removedOrderItems: orderItems.length,
        });
      } else {
        // Mark as out of stock instead of deleting
        const updated = await prisma.product.update({
          where: { id: productId },
          data: { stock: 0 },
        });

        return NextResponse.json({
          success: true,
          product: updated,
          markedOutOfStock: true,
          message:
            "Cannot delete product that is referenced in orders. Marked as out of stock instead.",
        });
      }
    }

    // If no related order items, proceed with normal deletion
    const deleted = await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, product: deleted });
  } catch (error: any) {
    console.error("Delete product error:", error);

    // Handle specific Prisma errors
    if (error.code === "P2014" || error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cannot delete product that is referenced in orders. Use the mark as out of stock option instead.",
        },
        { status: 400 }
      );
    }

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
