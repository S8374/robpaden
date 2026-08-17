import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "@/core/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const connectionString = config.database.url;

// Augment globalThis to prevent multiple instances during hot-reloads
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  (() => {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
