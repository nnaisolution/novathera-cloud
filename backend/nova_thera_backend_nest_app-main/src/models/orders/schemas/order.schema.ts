import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const orderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'FULFILLED',
  'SHIPPED',
  'CANCELLED',
  'REFUNDED',
]);

export const listOrdersInputSchema = paginationInputSchema
  .extend({
    status: orderStatusSchema.optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['createdAt', 'totalCents', 'status']).default('createdAt'),
  })
  .strict();

export const listMyOrdersInputSchema = paginationInputSchema
  .extend({
    sortBy: z.enum(['createdAt', 'totalCents']).default('createdAt'),
  })
  .strict();

export const orderIdInputSchema = z.object({ id: z.string().min(1) }).strict();

export const orderSessionIdInputSchema = z
  .object({ sessionId: z.string().min(1) })
  .strict();

export const setFulfillmentStatusInputSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(['FULFILLED', 'SHIPPED']),
    trackingNumber: z.string().max(200).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === 'SHIPPED' && !value.trackingNumber) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tracking number is required when marking as shipped',
        path: ['trackingNumber'],
      });
    }
  });

export type ListOrdersInput = z.infer<typeof listOrdersInputSchema>;
export type ListMyOrdersInput = z.infer<typeof listMyOrdersInputSchema>;
export type SetFulfillmentStatusInput = z.infer<
  typeof setFulfillmentStatusInputSchema
>;
