import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

/** Roles an admin may assign. `customer` is deliberately excluded. */
export const ASSIGNABLE_ROLES = [
  'admin',
  'manager',
  'staff',
  'receptionist',
] as const;

export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export const listStaffInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(120).optional(),
    role: z.enum(ASSIGNABLE_ROLES).optional(),
    includeCustomers: z.boolean().default(false),
  })
  .strict();

export const createStaffInputSchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1).max(120),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    role: z.enum(ASSIGNABLE_ROLES),
  })
  .strict();

/**
 * Open self-service admin registration.
 *
 * No permission gate by design — the caller is anonymous. Password rules are
 * stricter than for admin-created accounts because nobody is vouching for who
 * is on the other end.
 */
export const selfRegisterAdminInputSchema = z
  .object({
    email: z.string().email(),
    name: z.string().trim().min(1).max(120),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128)
      .refine((value) => /[a-z]/.test(value), 'Add a lowercase letter')
      .refine((value) => /[A-Z]/.test(value), 'Add an uppercase letter')
      .refine((value) => /[0-9]/.test(value), 'Add a number')
      .refine((value) => /[^A-Za-z0-9]/.test(value), 'Add a symbol'),
  })
  .strict();

export const setRoleInputSchema = z
  .object({
    userId: z.string().min(1),
    role: z.enum(ASSIGNABLE_ROLES),
  })
  .strict();

export const banUserInputSchema = z
  .object({
    userId: z.string().min(1),
    reason: z.string().min(1).max(200),
    /** Omit for an indefinite ban. */
    expiresInDays: z.number().int().min(1).max(3650).optional(),
  })
  .strict();

export const userIdInputSchema = z
  .object({ userId: z.string().min(1) })
  .strict();

export const setPasswordInputSchema = z
  .object({
    userId: z.string().min(1),
    newPassword: z.string().min(8).max(128),
  })
  .strict();

export const revokeSessionInputSchema = z
  .object({ sessionToken: z.string().min(1), userId: z.string().min(1) })
  .strict();

export type ListStaffInput = z.infer<typeof listStaffInputSchema>;
export type CreateStaffInput = z.infer<typeof createStaffInputSchema>;
export type SetRoleInput = z.infer<typeof setRoleInputSchema>;
export type BanUserInput = z.infer<typeof banUserInputSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordInputSchema>;
export type RevokeSessionInput = z.infer<typeof revokeSessionInputSchema>;
export type SelfRegisterAdminInput = z.infer<
  typeof selfRegisterAdminInputSchema
>;
