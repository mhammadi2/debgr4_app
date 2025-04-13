// app/api/diagnose/route.ts
import { readdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if uploads directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const uploadDirExists = existsSync(uploadDir);

    let files = [];
    if (uploadDirExists) {
      files = await readdir(uploadDir);
    }

    return NextResponse.json({
      uploadDirExists,
      uploadDirPath: uploadDir,
      files,
      publicDirExists: existsSync(path.join(process.cwd(), "public")),
      cwd: process.cwd(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
