// app/api/test-image/route.ts
import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    // Get the URL parameters
    const url = new URL(request.url);
    const imagePath = url.searchParams.get("path");

    if (!imagePath) {
      return NextResponse.json(
        { error: "No image path provided" },
        { status: 400 }
      );
    }

    // Resolve the full path (make sure it's within public/uploads for security)
    const fullPath = path.join(process.cwd(), "public", imagePath);

    // Security check to prevent directory traversal
    if (!fullPath.startsWith(path.join(process.cwd(), "public"))) {
      return NextResponse.json({ error: "Invalid path" }, { status: 403 });
    }

    // Check if file exists
    if (!existsSync(fullPath)) {
      return NextResponse.json(
        {
          error: "File not found",
          requestedPath: imagePath,
          fullPath: fullPath,
        },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = readFileSync(fullPath);

    // Determine the MIME type based on file extension
    const ext = path.extname(fullPath).toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";

    // Return the image with appropriate content type
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
