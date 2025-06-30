// File: prisma/seed.ts (Corrected)

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- 1. Seed the Admin table for Admin login ---
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "password123";

  // Hash the password
  const adminHashedPassword = await bcrypt.hash(adminPassword, 12);

  // Use `upsert` to create the admin in the `Admin` table
  const admin = await prisma.admin.upsert({
    where: { username: adminUsername }, // Find admin by its unique username
    update: {
      // If found, ensure the password and role are up-to-date
      passwordHash: adminHashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      // If not found, create a new admin with these details
      username: adminUsername,
      passwordHash: adminHashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`✅ Upserted Admin: ${admin.username}`);

  // --- 2. Seed the User table for regular customer login (Your existing logic is great!) ---
  const userEmail = "user@example.com";
  const userPassword = "user123";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (!existingUser) {
    const userHashedPassword = await bcrypt.hash(userPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        name: "Regular User",
        password: userHashedPassword, // Note: your `User` model uses `password`
        role: UserRole.USER,
      },
    });
    console.log(`✅ Created Regular User: ${user.email}`);
  } else {
    console.log(`- Regular User already exists: ${existingUser.email}`);
  }

  console.log("🌱 Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
