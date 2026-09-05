import { createHash } from 'crypto';
import { Prisma } from '@prisma/client';

/**
 * Safely extracts client IP from request headers.
 * Looks for 'x-forwarded-for', 'x-real-ip', 'cf-connecting-ip', or falls back to '127.0.0.1'.
 */
export function getClientIp(headersLike: Headers | { get(name: string): string | null }): string {
  const forwarded = headersLike.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = headersLike.get('x-real-ip');
  if (realIp && realIp.trim()) return realIp.trim();

  const cfIp = headersLike.get('cf-connecting-ip');
  if (cfIp && cfIp.trim()) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Computes a SHA-256 hex digest of the client IP.
 * Raw IPs are never stored — only the hash is persisted or keyed.
 */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * In-memory sliding window rate limiter.
 * Suitable for serverless / edge instances to prevent burst abuse and DoS.
 */
interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

// Cleanup stale keys periodically to avoid memory growth.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(now: number, maxWindowMs: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of memoryStore.entries()) {
    const freshTimestamps = record.timestamps.filter((ts) => now - ts < maxWindowMs);
    if (freshTimestamps.length === 0) {
      memoryStore.delete(key);
    } else {
      record.timestamps = freshTimestamps;
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

/**
 * Checks and increments a sliding window rate limit for an in-memory key.
 */
export function checkSlidingWindowRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  cleanupStaleEntries(now, windowMs);

  let record = memoryStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(key, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const count = record.timestamps.length;
  if (count >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const oldestTimestamp = record.timestamps[0];
  const resetInSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

  return {
    allowed: true,
    remaining,
    resetInSeconds,
  };
}

/** Predefined Rate Limiters for API routes */
export const RateLimiters = {
  /** Upload presigned URL: 15 per 10 minutes */
  uploadPresign: (ipHash: string) =>
    checkSlidingWindowRateLimit(`presign:${ipHash}`, 15, 10 * 60 * 1000),

  /** Telemetry batch ingestion: 60 per minute */
  telemetry: (ipHash: string) =>
    checkSlidingWindowRateLimit(`telemetry:${ipHash}`, 60, 60 * 1000),

  /** Review creation: 10 per hour per IP */
  reviews: (ipHash: string) =>
    checkSlidingWindowRateLimit(`reviews:${ipHash}`, 10, 60 * 60 * 1000),

  /** Listing submission burst protection: 2 per minute per IP */
  listingBurst: (ipHash: string) =>
    checkSlidingWindowRateLimit(`listing_burst:${ipHash}`, 2, 60 * 1000),

  /** WhatsApp phone reveal anti-scraping: 30 reveals per 10 minutes per IP */
  phoneReveal: (ipHash: string) =>
    checkSlidingWindowRateLimit(`reveal:${ipHash}`, 30, 10 * 60 * 1000),
};

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
