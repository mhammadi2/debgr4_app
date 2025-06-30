// File: lib/auth.ts (Complete and Corrected)

import {
  getServerSession,
  type NextAuthOptions,
  type User as NextAuthUser,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

// --- TYPE AUGMENTATION ---
// This adds the 'role' and 'id' to NextAuth's default User and Session types
// for type safety throughout your application.
declare module "next-auth" {
  interface User extends NextAuthUser {
    role?: UserRole;
  }
  interface Session {
    user?: User;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}

// --- AUTHENTICATION OPTIONS ---
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      id: "credentials",
      credentials: {
        // The form field `id` is 'email', so we expect `creds.email`.
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      // --- THE CORE AUTHORIZATION LOGIC ---
      async authorize(creds) {
        if (!creds?.email || !creds.password) {
          return null; // A null return is expected on failure
        }

        // 1. Attempt to find as an ADMIN by username
        const admin = await prisma.admin.findUnique({
          where: { username: creds.email },
        });

        if (
          admin &&
          (await bcrypt.compare(creds.password, admin.passwordHash))
        ) {
          // Admin authenticated successfully
          return {
            id: admin.id,
            name: admin.username,
            email: `${admin.username}@admin.local`, // Dummy email for NextAuth
            role: admin.role,
          };
        }

        // 2. If not admin, attempt to find as a CUSTOMER by email
        const customer = await prisma.user.findUnique({
          where: { email: creds.email },
        });

        if (
          customer &&
          customer.password &&
          (await bcrypt.compare(creds.password, customer.password))
        ) {
          // Customer authenticated successfully
          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            role: customer.role,
          };
        }

        // 3. If no user found in either table, authentication fails
        return null;
      },
    }),
  ],

  // --- CALLBACKS TO ENRICH THE TOKEN & SESSION ---
  callbacks: {
    // The `jwt` callback runs first, adding the role to the token.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // The `session` callback then transfers the role from the token to the session object.
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    // NOTE: We have intentionally REMOVED the `signIn` callback.
    // Handling redirects on the client-side after login is more reliable.
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect user to login page on error
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// --- HELPER FUNCTIONS ---
export const getAuth = () => getServerSession(authOptions);

export async function requireAdmin() {
  const session = await getAuth();
  if (session?.user.role !== "ADMIN" && session?.user.role !== "SUPER_ADMIN") {
    redirect("/login?error=Unauthorized");
  }
  return session;
}
