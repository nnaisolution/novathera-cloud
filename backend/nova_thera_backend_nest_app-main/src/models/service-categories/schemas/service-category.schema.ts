import { z } from 'zod';

export const categoryStatusSchema = z.enum(['ACTIVE', 'HIDDEN']);

export const createServiceCategoryInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    iconUrl: z.string().url().optional(),
    displayOrder: z.number().int().min(0).default(0),
    status: categoryStatusSchema.default('ACTIVE'),
  })
  .strict();

export const updateServiceCategoryInputSchema = createServiceCategoryInputSchema
  .partial()
  .extend({
    id: z.string().min(1),
  })
  .strict();

export const reorderServiceCategoriesInputSchema = z
  .object({
    orderedIds: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const serviceCategoryIdInputSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export type CreateServiceCategoryInput = z.infer<
  typeof createServiceCategoryInputSchema
>;
export type UpdateServiceCategoryInput = z.infer<
  typeof updateServiceCategoryInputSchema
>;
