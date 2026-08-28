import { z } from "zod";

export const listBookingConcernsInput = z.object({
  categoryId: z.string().min(1).optional(),
  search: z.string().trim().max(200).optional(),
});

export type ListBookingConcernsInput = z.infer<typeof listBookingConcernsInput>;
