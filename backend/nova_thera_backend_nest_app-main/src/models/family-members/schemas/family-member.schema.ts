import { z } from 'zod';

export const createFamilyMemberInputSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    relationship: z.string().trim().min(1).max(100),
    photoUrl: z.string().url().optional(),
  })
  .strict();

export const updateFamilyMemberInputSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(1).max(200).optional(),
    relationship: z.string().trim().min(1).max(100).optional(),
    photoUrl: z.string().url().optional(),
  })
  .strict();

export const familyMemberIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export type CreateFamilyMemberInput = z.infer<
  typeof createFamilyMemberInputSchema
>;
export type UpdateFamilyMemberInput = z.infer<
  typeof updateFamilyMemberInputSchema
>;
