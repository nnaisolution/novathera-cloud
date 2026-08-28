import { z } from "zod";

export const joinWaitlistInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  source: z.string().trim().max(200).optional(),
  /** Honeypot — must stay empty. Bots that fill it are rejected silently. */
  website: z.string().max(0),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistInput>;
