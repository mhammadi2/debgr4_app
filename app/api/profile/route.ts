// File: app/api/profile/route.ts

import { NextResponse } from "next/server";
// We reuse our existing helper here, with the correct name!
import { getAuthSession } from "@/lib/auth"; // ✅ FIX: Use our standard server helper.
import { prisma } from "@/lib/db";

/**
 * GET: Fetches the profile data for the currently authenticated user.
 */
export async function GET(request: Request) {
  try {
    // 1. Get the session using our standardized helper.
    const session = await getAuthSession();

    // Guard clause: If no user is logged in, deny access.
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch the user from the database using the session's user ID.
    const userProfile = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      // 3. Select only the fields that are safe to expose to the client.
      // CRITICAL: Never return the password hash.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        createdAt: true,
      },
    });

    // Guard clause: If the user from the session doesn't exist in the DB (highly unlikely but possible)
    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 4. Return the sanitized user profile data.
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("[PROFILE_API_ERROR]", error);
    return NextResponse.json(
      { error: "An internal error occurred." },
      { status: 500 }
    );
  }
}
