import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

const shippingTierFieldsSchema = z
  .object({
    name: z.string().min(1).max(100),
    rateCents: z.number().int().min(0),
    freeOverCents: z.number().int().positive().nullable().optional(),
    minDeliveryDays: z.number().int().min(0).nullable().optional(),
    maxDeliveryDays: z.number().int().min(0).nullable().optional(),
    active: z.boolean().default(true),
  })
  .strict();

function withDeliveryRefine<T extends z.ZodType>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const v = value as {
      minDeliveryDays?: number | null;
      maxDeliveryDays?: number | null;
    };
    if (
      v.minDeliveryDays != null &&
      v.maxDeliveryDays != null &&
      v.maxDeliveryDays < v.minDeliveryDays
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'maxDeliveryDays must be >= minDeliveryDays',
        path: ['maxDeliveryDays'],
      });
    }
  });
}

export const createShippingTierInputSchema = withDeliveryRefine(
  shippingTierFieldsSchema,
);

export const updateShippingTierInputSchema = withDeliveryRefine(
  shippingTierFieldsSchema
    .partial()
    .extend({ id: z.string().min(1) })
    .strict(),
);

export const listShippingTiersInputSchema = paginationInputSchema
  .extend({
    active: z.boolean().optional(),
    sortBy: z.enum(['createdAt', 'name', 'rateCents']).default('createdAt'),
  })
  .strict();

export const shippingTierIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export type CreateShippingTierInput = z.infer<
  typeof createShippingTierInputSchema
>;
export type UpdateShippingTierInput = z.infer<
  typeof updateShippingTierInputSchema
>;
export type ListShippingTiersInput = z.infer<
  typeof listShippingTiersInputSchema
>;
