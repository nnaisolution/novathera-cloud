/**
 * Minimal in-memory per-IP limiter for routes the global Nest ThrottlerGuard
 * does not cover, such as the raw Express middleware the tRPC router is mounted
 * as. Correct for single-instance deployments only; a multi-instance rollout
 * needs a shared store.
 */
export function createIpRateLimiter(limit: number, windowMs: number) {
  const buckets = new Map<string, { count: number; resetAt: number }>();

  return (
    req: { ip?: string; socket?: { remoteAddress?: string } },
    res: { status: (code: number) => { json: (body: unknown) => void } },
    next: () => void,
  ) => {
    const key = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (bucket.count >= limit) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    bucket.count += 1;
    next();
  };
}
