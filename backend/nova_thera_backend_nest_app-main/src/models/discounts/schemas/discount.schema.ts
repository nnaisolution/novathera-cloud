import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const discountTypeSchema = z.enum(['PERCENT', 'FIXED']);

export const createDiscountInputSchema = z
  .object({
    code: z
      .string()
      .min(1)
      .max(50)
      .transform((value) => value.trim().toUpperCase()),
    type: discountTypeSchema,
    percentOff: z.number().int().min(1).max(100).optional(),
    amountOffCents: z.number().int().positive().optional(),
    expiresAt: z.coerce.date().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.type === 'PERCENT' && value.percentOff == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'percentOff is required for PERCENT discounts',
        path: ['percentOff'],
      });
    }
    if (value.type === 'FIXED' && value.amountOffCents == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'amountOffCents is required for FIXED discounts',
        path: ['amountOffCents'],
      });
    }
  });

export const listDiscountsInputSchema = paginationInputSchema
  .extend({
    active: z.boolean().optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['createdAt', 'code']).default('createdAt'),
  })
  .strict();

export const discountIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export type CreateDiscountInput = z.infer<typeof createDiscountInputSchema>;
export type ListDiscountsInput = z.infer<typeof listDiscountsInputSchema>;
