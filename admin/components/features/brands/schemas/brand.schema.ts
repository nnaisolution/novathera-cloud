import { z } from 'zod'

export const brandFormSchema = z.object({
  name: z.string().min(1).max(120),
  tagline: z.string().max(300).optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
})

export type BrandFormValues = z.infer<typeof brandFormSchema>
