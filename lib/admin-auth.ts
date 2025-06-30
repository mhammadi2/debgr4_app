// lib/admin-auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Predefined admin accounts (you can also store these in database)
const ADMIN_ACCOUNTS = [
  {
    id: "admin-1",
    username: "admin",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewkKBtS8vkNbKVS6", // "admin123"
    name: "System Administrator",
    role: "SUPER_ADMIN",
  },
  {
    id: "admin-2",
    username: "manager",
    password: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "manager123"
    name: "Store Manager",
    role: "ADMIN",
  },
];

export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "admin-credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // Check predefined admin accounts
          const admin = ADMIN_ACCOUNTS.find(
            (acc) => acc.username === credentials.username
          );

          if (!admin) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            admin.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: admin.id,
            name: admin.name,
            username: admin.username,
            role: admin.role,
          };
        } catch (error) {
          console.error("Admin auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};
