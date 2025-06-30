// utils/auth.ts (UPDATED for String role)
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface AuthorizedSession extends Session {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string; // Change from 'Role' enum to 'string'
  };
}

export async function authorizeAdmin(
  req: NextRequest
): Promise<NextResponse | AuthorizedSession> {
  const session = (await getServerSession(
    authOptions
  )) as AuthorizedSession | null;

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // Check if the role matches "admin" or "super_admin" (case-insensitive for robustness)
  if (
    session.user?.role?.toLowerCase() !== "admin" &&
    session.user?.role?.toLowerCase() !== "super_admin"
  ) {
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  return session; // Return the session if authorized
}
