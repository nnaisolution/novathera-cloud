import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const brandOnboardingStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'PENDING_VERIFICATION',
  'COMPLETE',
  'RESTRICTED',
]);

const brandFieldsSchema = z
  .object({
    name: z.string().min(1).max(120),
    tagline: z.string().max(300).nullable().optional(),
    logoUrl: z.string().url().nullable().optional(),
    displayOrder: z.number().int().min(0).default(0),
    active: z.boolean().default(true),
    /**
     * The platform brand owns the Stripe account customers actually pay, so its
     * share of an order never moves. Exactly one brand may hold this — the
     * service enforces it.
     */
    isPlatform: z.boolean().default(false),
  })
  .strict();

export const createBrandInputSchema = brandFieldsSchema;

export const updateBrandInputSchema = brandFieldsSchema
  .partial()
  .extend({ id: z.string().min(1) })
  .strict();

export const listBrandsInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    active: z.boolean().optional(),
    sortBy: z
      .enum(['displayOrder', 'name', 'createdAt'])
      .default('displayOrder'),
  })
  .strict();

export const brandIdInputSchema = z.object({ id: z.string().min(1) }).strict();

export type CreateBrandInput = z.infer<typeof createBrandInputSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandInputSchema>;
export type ListBrandsInput = z.infer<typeof listBrandsInputSchema>;
