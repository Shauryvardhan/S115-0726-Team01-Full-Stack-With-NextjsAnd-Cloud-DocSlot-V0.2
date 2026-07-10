// Re-export the canonical Prisma client to avoid duplicate implementations
export * from "./prisma";

// Also export the named `prisma` for imports that expect it
export { prisma } from "./prisma";