import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client instance for database access.
 *
 * Connection is established lazily on first query, not at import time,
 * so importing this module in tests or bootstrap code is safe even
 * when the database isn't running.
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

/**
 * Gracefully disconnects the Prisma client.
 * Call this during application shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

