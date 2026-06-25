import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';

/**
 * Computes a SHA-256 hex digest of the client IP.
 * Raw IPs are never stored — only the hash is persisted.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Thrown by checkAndIncrementRateLimit when the per-IP daily limit is exceeded.
 */
export class RateLimitError extends Error {
  constructor() {
    super('Rate limit exceeded');
    this.name = 'RateLimitError';
  }
}

/**
 * Checks the rate limit for a given IP hash on the current UTC day.
 * If the limit (5 submissions per day) is not exceeded, increments the counter.
 * If the limit IS exceeded, throws a RateLimitError.
 *
 * Intended to be called inside a Prisma transaction alongside the listing
 * creation, so the count only increments when the listing insert succeeds.
 *
 * `tx` is typed with Prisma's officially-exported transaction-client type
 * (`Prisma.TransactionClient`) — the idiomatic type for the client passed into
 * `prisma.$transaction(async (tx) => …)`.
 */
export async function checkAndIncrementRateLimit(
  ipHash: string,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD UTC

  // Check existing count BEFORE upserting to provide a clean error path.
  const existing = await tx.submissionRateLimit.findUnique({
    where: { ipHash_date: { ipHash, date } },
    select: { count: true },
  });

  if (existing && existing.count >= 5) {
    throw new RateLimitError();
  }

  // Upsert: create with count=1 or increment existing count by 1.
  await tx.submissionRateLimit.upsert({
    where: { ipHash_date: { ipHash, date } },
    create: { ipHash, date, count: 1 },
    update: { count: { increment: 1 } },
  });
}
