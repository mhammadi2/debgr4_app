// File: lib/auth.ts

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
        if (user.role === UserRole.ADMIN) return null; // Prevent Admin login with user credentials

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

        // Ensure the admin is valid and return their role
        return {
          id: admin.id,
          email: admin.username, // or another attribute to represent admin email
          name: admin.username,
          role: admin.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Attach user data to the token
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach token data to session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login", // Redirect to login page
    error: "/admin/login", // Redirect to login on error
  },
};

/* ==========================================================
   HELPER FUNCTIONS 
   ========================================================== */
export const getAuthSession = () => getServerSession(authOptions);

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

export async function requireUser() {
  const session = await getAuthSession();
  const user = session?.user;

  if (!user || user.role !== UserRole.USER) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized: Customer login required." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return user;
}
