import { z } from 'zod';

export const addCartItemInputSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().max(99).default(1),
  })
  .strict();

export const updateCartQuantityInputSchema = z
  .object({
    productId: z.string().min(1),
    quantity: z.number().int().min(0).max(99),
  })
  .strict();

export const removeCartItemInputSchema = z
  .object({
    productId: z.string().min(1),
  })
  .strict();

export type AddCartItemInput = z.infer<typeof addCartItemInputSchema>;
export type UpdateCartQuantityInput = z.infer<
  typeof updateCartQuantityInputSchema
>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemInputSchema>;
