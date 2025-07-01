// File: lib/auth.ts  (ALIGNED)

import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import { compare } from "bcryptjs"; // ← same lib as seed.ts
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

/* ─────────────────────  NextAuth configuration  ───────────────────── */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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

        /* Block admins from logging in through the public portal */
        if (user.role === UserRole.ADMIN) return null;

        const ok = await compare(creds.password, user.password);
        if (!ok) return null;

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

        const ok = await compare(creds.password, admin.passwordHash);
        if (!ok) return null;

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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },
};

/* ─────────────────────  Helper functions  ───────────────────── */
export const getAuth = () => getServerSession(authOptions);

/**
 * requireAdmin
 * ------------
 * Use inside any route that must be restricted to admins.
 * If the caller is not an admin it returns a 403 NextResponse,
 * otherwise it returns the admin’s session user object.
 */
export async function requireAdmin() {
  const session = await getAuth();

  if (session?.user?.role !== UserRole.ADMIN) {
    return new NextResponse(
      JSON.stringify({ error: "Forbidden – admin only." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return session.user; // { id, email, role }
}
