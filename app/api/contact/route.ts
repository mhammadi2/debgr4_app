// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    // Process the contact form submission
    // Send email, log to database, etc.

    return NextResponse.json(
      {
        message: "Submission successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Submission failed",
      },
      { status: 500 }
    );
  }
}
