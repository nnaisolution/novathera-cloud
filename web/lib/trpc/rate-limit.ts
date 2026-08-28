import { TRPCError } from "@trpc/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

/**
 * Simple in-memory rate limiter for public-site embedded tRPC mutations
 * (waitlist / contact). Suitable for single-instance local/prod preview;
 * replace with edge/redis limiter when deploying multi-instance.
 */
export function assertRateLimit(options: {
  key: string;
  limit: number;
  windowMs: number;
}): void {
  const now = Date.now();
  const existing = buckets.get(options.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return;
  }

  if (existing.count >= options.limit) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests. Please try again later.",
    });
  }

  existing.count += 1;
}
