import { z } from "zod";

export const bookingDetailsInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email address").max(255),
  phone: z.string().trim().min(1, "Contact number is required").max(30),
  termsAccepted: z.literal(true, {
    error: "You must agree to the terms and privacy policy",
  }),
});

export type BookingDetailsInput = z.infer<typeof bookingDetailsInput>;
