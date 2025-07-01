// File: middleware.ts (Corrected to match your schema)

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserDashboardRoute = pathname.startsWith("/dashboard");

  // --- RULE 1: PROTECT THE ADMIN AREA ---
  if (isAdminRoute && pathname !== "/admin/login") {
    // ✅ CORRECTION: Removed the check for `SUPER_ADMIN`.
    // The logic now correctly checks if the user's role is exactly `ADMIN`.
    if (!token || token.role !== UserRole.ADMIN) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- RULE 2: PROTECT THE USER DASHBOARD ---
  if (isUserDashboardRoute) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  // --- RULE 3: ALLOW THE REQUEST ---
  return NextResponse.next();
}

// --- CONFIGURATION ---
// This configuration remains correct.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
