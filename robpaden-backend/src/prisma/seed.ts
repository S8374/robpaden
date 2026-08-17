import { prisma } from "../lib/prisma";
import { encryptPassword } from "../core/utils/encryption";
import * as dotenv from "dotenv";

dotenv.config();

const STANDARD_PERMISSIONS = [
  { name: "DASHBOARD", description: "Access to the main dashboard" },
  { name: "LIVE_BOARD", description: "Access to the Live TV Board" },
  { name: "AGENTS", description: "Manage and view agents" },
  { name: "REPORTS", description: "Access reports and analytics" },
  { name: "SALES_HISTORY", description: "View the entire sales history" }
];

async function main() {
  console.log("Starting database seed...");

  // 1. Create or update standard permissions
  console.log("Seeding permissions...");
  const permissionIds: number[] = [];
  
  for (const perm of STANDARD_PERMISSIONS) {
    const upsertedPerm = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {}, // Do nothing if it already exists
      create: {
        name: perm.name,
        description: perm.description
      }
    });
    permissionIds.push(upsertedPerm.id);
  }

  // 2. Setup Super Admin
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@robpaden.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "SuperAdmin123!";
  const encryptedPassword = encryptPassword(adminPassword);

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { permissions: true } 
  });

  if (existingAdmin) {
    console.log(`Admin user ${adminEmail} already exists. Updating password to encrypted format and linking permissions.`);
    
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: encryptedPassword,
        permissions: {
          connect: permissionIds.map(id => ({ id }))
        }
      }
    });
    
    console.log("Permissions updated for existing Admin.");
    return;
  }

  // Create admin user and link all standard permissions
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: encryptedPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
      permissions: {
        connect: permissionIds.map(id => ({ id }))
      }
    },
  });

  console.log(`Successfully created Super Admin: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("Database connection closed.");
  });
