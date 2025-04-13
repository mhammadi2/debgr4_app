// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // You'll need to install this: npm install uuid

// Ensure upload directory exists
async function ensureUploadDirExists() {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error("Failed to create upload directory:", error);
  }
  return uploadDir;
}

// Function to handle image upload
async function saveImageToServer(file: File): Promise<string> {
  // Create a unique filename
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;

  // Define the upload directory and ensure it exists
  const uploadDir = await ensureUploadDirExists();

  // Read file as ArrayBuffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Write file to the server
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  // Return the path that can be used in <img> tags
  return `/uploads/${fileName}`;
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Product category is required" },
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

    // Process the image if it exists
    let imageUrl = null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveImageToServer(imageFile);
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price,
        imageUrl,
        category,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Handle multipart form data
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const category = formData.get("category") as string;
    const imageFile = formData.get("image") as File | null;
    const keepExistingImage = formData.get("keepExistingImage") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    // Validate price if provided
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      return NextResponse.json(
        { error: "Price must be a non-negative number" },
        { status: 400 }
      );
    }

    // Get the existing product to check its current image
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Process the image if a new one is uploaded
    let imageUrl = keepExistingImage ? existingProduct.imageUrl : null;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await saveImageToServer(imageFile);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description: description || "",
        price,
        imageUrl,
        category,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
