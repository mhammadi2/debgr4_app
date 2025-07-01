// prisma/seed.ts
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database …");

  /* ──────────────── 1.  ADMIN  ──────────────── */
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";

  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: { passwordHash: adminHash, role: UserRole.ADMIN },
    create: {
      username: adminUsername,
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`✅  Admin account ready  →  ${admin.username}`);

  /* ──────────────── 2.  Example CUSTOMER  ──────────────── */
  const userEmail = process.env.EXAMPLE_USER_EMAIL;
  const userPassword = process.env.EXAMPLE_USER_PASSWORD;

  if (userEmail && userPassword) {
    const existing = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!existing) {
      const userHash = await bcrypt.hash(userPassword, 12);
      await prisma.user.create({
        data: {
          email: userEmail,
          name: "Example User",
          password: userHash,
          role: UserRole.USER,
        },
      });
      console.log(`✅  Customer account ready  →  ${userEmail}`);
    } else {
      console.log(`ℹ️  Customer already exists  →  ${existing.email}`);
    }
  }

  console.log("🌱  Seeding finished.\n");
}

main()
  .catch((err) => {
    console.error("❌  Seed error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
