import { z } from "zod";

export const contactServiceOptions = [
  "Aesthetics",
  "Recovery therapies",
  "Diagnostics",
  "Wellness optimization",
  "Membership",
  "Other",
] as const;

export const submitContactInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  service: z.enum(contactServiceOptions, {
    error: "Please select a service",
  }),
  message: z.string().trim().min(1, "Message is required").max(5000),
  termsAccepted: z.literal(true, {
    error: "You must agree to the terms and privacy policy",
  }),
  /** Honeypot — must stay empty. Bots that fill it are rejected silently. */
  website: z.string().max(0),
});

export type SubmitContactInput = z.infer<typeof submitContactInput>;
