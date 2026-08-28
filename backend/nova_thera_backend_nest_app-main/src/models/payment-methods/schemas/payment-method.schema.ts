import { z } from 'zod';

export const paymentMethodIdInputSchema = z
  .object({ paymentMethodId: z.string().min(1) })
  .strict();

export type PaymentMethodIdInput = z.infer<typeof paymentMethodIdInputSchema>;
