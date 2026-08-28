import { z } from 'zod';

export const createCheckoutSessionInputSchema = z.object({}).strict();

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionInputSchema
>;
