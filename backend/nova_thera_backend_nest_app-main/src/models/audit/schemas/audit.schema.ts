import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

/** Every action the trail can record. Kept explicit so the UI can label them. */
export const AUDIT_ACTIONS = [
  'auth.signed_in',
  'auth.signed_out',
  'auth.impersonation_started',
  'auth.impersonation_stopped',
  'user.created',
  'user.role_changed',
  'user.banned',
  'user.unbanned',
  'user.password_reset',
  'user.deleted',
  'user.email_changed',
  'session.revoked',
  'settings.updated',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const listAuditInputSchema = paginationInputSchema
  .extend({
    action: z.enum(AUDIT_ACTIONS).optional(),
    actorUserId: z.string().min(1).optional(),
    search: z.string().max(120).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  })
  .strict();

export type ListAuditInput = z.infer<typeof listAuditInputSchema>;
