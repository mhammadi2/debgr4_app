// In: app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/auth"; // Secures the endpoint

export async function POST(request: NextRequest) {
  try {
    // Ensure only admins can upload files
    await requireAdmin();

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided." },
        { status: 400 }
      );
    }

    // Sanitize the filename to prevent security issues like directory traversal
    const filename = `${Date.now()}-${file.name.replace(
      /[^a-zA-Z0-9._-]/g,
      ""
    )}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Store the file in the `public/uploads` directory. Make sure this folder exists.
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);
    console.log(`File uploaded to: ${filePath}`);

    // Return the public path that will be stored in the database
    const publicPath = `/uploads/${filename}`;

    return NextResponse.json({ success: true, imageUrl: publicPath });
  } catch (error: any) {
    console.error("Upload error:", error);
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: "File upload failed." },
      { status: 500 }
    );
  }
}
