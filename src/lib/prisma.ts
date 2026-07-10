import { PrismaClient } from "@prisma/client";

// In development, Next.js hot-reloads files constantly, which would
// normally create a new PrismaClient on every reload and exhaust your
// database connections. This pattern stores the client on the global
// object so it survives hot reloads and only gets created once.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}