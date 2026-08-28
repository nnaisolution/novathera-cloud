/**
 * Pulls the "who and from where" fields for an audit entry off a tRPC context.
 * Kept separate from the audit service so any router can use it without
 * depending on how entries are stored.
 */

type ActorContext = {
  user: { id: string; email?: string | null; role?: unknown };
  headers: Headers;
};

export type AuditActor = {
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string | null;
  ipAddress: string | null;
  userAgent: string | null;
};

export function auditActor(ctx: ActorContext): AuditActor {
  const role = ctx.user.role;

  return {
    actorUserId: ctx.user.id,
    actorEmail: ctx.user.email ?? null,
    actorRole: typeof role === 'string' ? role : null,
    // x-forwarded-for may carry a proxy chain; the client is the first entry.
    ipAddress:
      ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      ctx.headers.get('x-real-ip') ??
      null,
    userAgent: ctx.headers.get('user-agent'),
  };
}

/** Field names whose values differ between two flat objects. */
export function changedKeys(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown>,
): string[] {
  if (!before) return Object.keys(after);

  return Object.keys(after).filter(
    (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  );
}
