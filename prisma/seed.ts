import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "rakib@gmail.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("123456", 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        fullname: "Hospital Super Admin",
        phone: "01700000000",
        role: "ADMIN",
        adminProfile: {
          create: {
            designation: "Super Administrator",
            department: "Central Operations",
          },
        },
      },
    });

    console.log(`Super Admin seeded successfully: ${adminEmail} / 123456`);
  } else {
    console.log("Admin already exists in database.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });