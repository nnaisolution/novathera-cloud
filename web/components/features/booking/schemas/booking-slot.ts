import { z } from "zod";

export const listBookingSlotsInput = z.object({
  locationId: z.string().min(1),
  concernId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type ListBookingSlotsInput = z.infer<typeof listBookingSlotsInput>;
