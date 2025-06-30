// In: app/api/profile/route.ts

import { NextResponse } from "next/server";
// We reuse our existing `getSession` helper here!
import { getSession } from "@/lib/auth";

// This defines the GET method for our /api/profile endpoint.
export async function GET(request: Request) {
  try {
    // getSession securely reads the session cookie on the server.
    const session = await getSession();

    // If there is no session or user, the request is unauthorized.
    if (!session?.user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If authorized, return the user data.
    // We only send the necessary fields to the client.
    return NextResponse.json({
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    });
  } catch (error) {
    console.error("API Profile Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
