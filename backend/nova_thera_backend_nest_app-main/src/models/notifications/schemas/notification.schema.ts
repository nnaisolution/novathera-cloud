import { z } from 'zod';

export const registerDeviceInputSchema = z
  .object({
    platform: z.enum(['APNS', 'FCM']),
    tokenHash: z.string().min(32),
    expoPushToken: z
      .string()
      .min(8)
      .max(512)
      .regex(/^Expo(nent)?PushToken\[.+\]$/)
      .optional(),
  })
  .strict();

export type RegisterDeviceInput = z.infer<typeof registerDeviceInputSchema>;
