import { z } from "zod";

import { bookingDetailsInput } from "@/components/features/booking/schemas/booking-details";

export const submitBookingInput = z.object({
  details: bookingDetailsInput,
  locationId: z.string().min(1),
  concernId: z.string().min(1),
  slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slotTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export type SubmitBookingInput = z.infer<typeof submitBookingInput>;
