import { PrismaClient } from '@prisma/client'

// BigInt → JSON serialization (Prisma returns BigInt for auto-increment IDs and COUNT)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(BigInt.prototype as any).toJSON = function () { return Number(this) }

// Prisma client singleton — prevents connection pool exhaustion in Next.js dev mode
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
