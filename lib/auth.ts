// File: lib/auth.ts (Final, Aligned Version)

import { NextAuthOptions, getServerSession } from "next-auth";
import type { User } from "next-auth"; // Use type for cleaner imports
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db";
import { compare } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

// --- Custom Type Declarations for Session and JWT ---
// This is essential for TypeScript to understand our custom session data.
declare module "next-auth" {
  interface Session {
    user: User & {
      id: string;
      role: UserRole;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

/* ==========================================================
   AUTH OPTIONS
   ========================================================== */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    /* -------- 1.  Customer / USER login -------- */
    CredentialsProvider({
      id: "credentials-user",
      name: "Customer Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.email || !creds?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: creds.email },
        });
        if (!user || !user.password) return null;
        if (user.role === UserRole.ADMIN) return null;

        const isPasswordCorrect = await compare(creds.password, user.password);
        if (!isPasswordCorrect) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    /* -------- 2.  Admin login (username) -------- */
    CredentialsProvider({
      id: "credentials-admin",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        if (!creds?.username || !creds?.password) return null;

        const admin = await prisma.admin.findUnique({
          where: { username: creds.username },
        });
        if (!admin) return null;

        const isPasswordCorrect = await compare(
          creds.password,
          admin.passwordHash
        );
        if (!isPasswordCorrect) return null;

        return {
          id: admin.id,
          email: admin.username,
          name: admin.username,
          role: admin.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    // This callback makes the custom data available on the `session` object.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

/* ==========================================================
   HELPER FUNCTIONS 
   ========================================================== */

/**
 * Retrieves the session on the server side. Can be used in Server Components,
 * API routes, and route handlers.
 * @returns {Promise<Session | null>} The user's session object or null.
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * A middleware-like helper for API routes that must be restricted to admins.
 * Returns the admin's session user object on success, or a 403 Forbidden NextResponse on failure.
 * @returns {Promise<User | NextResponse>}
 */
export async function requireAdmin() {
  const session = await getAuthSession();
  const user = session?.user;

  if (user?.role !== UserRole.ADMIN) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: Admin access required." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return user;
}

/**
 * A middleware-like helper for API routes that must be restricted to authenticated customers.
 * Returns the user's session object on success, or a 401 Unauthorized NextResponse on failure.
 * @returns {Promise<User | NextResponse>}
 */
export async function requireUser() {
  const session = await getAuthSession();
  const user = session?.user;

  // Deny access if there is no user or if the user is an admin
  if (!user || user.role !== UserRole.USER) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized: Customer login required." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return user;
}
