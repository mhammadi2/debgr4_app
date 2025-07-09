// lib/db.ts (Revised with Conditional Logging)

import { PrismaClient } from "@prisma/client";

// Define the type for the global object to avoid 'any'
declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// In development, this prevents multiple instances of Prisma Client from being created due to hot-reloading.
export const prisma =
  global.prisma ||
  new PrismaClient({
    // Conditionally enable logging based on the environment
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
