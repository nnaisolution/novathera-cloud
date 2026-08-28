import { z } from 'zod'

/**
 * Mirrors the backend's `selfRegisterAdminInputSchema`. The server re-validates
 * everything — this exists to give immediate feedback, not to enforce.
 */
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(120),
    email: z.string().trim().email('Enter a valid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128)
      .refine((value) => /[a-z]/.test(value), 'Add a lowercase letter')
      .refine((value) => /[A-Z]/.test(value), 'Add an uppercase letter')
      .refine((value) => /[0-9]/.test(value), 'Add a number')
      .refine((value) => /[^A-Za-z0-9]/.test(value), 'Add a symbol'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>
