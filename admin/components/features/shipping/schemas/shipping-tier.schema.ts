import { z } from 'zod'

export const shippingTierFormSchema = z
  .object({
    name: z.string().min(1).max(100),
    rate: z.coerce.number().min(0),
    freeOver: z.coerce.number().positive().optional().or(z.literal('')),
    minDeliveryDays: z.coerce.number().int().min(0).optional().or(z.literal('')),
    maxDeliveryDays: z.coerce.number().int().min(0).optional().or(z.literal('')),
    active: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    const min =
      value.minDeliveryDays === '' || value.minDeliveryDays == null
        ? null
        : Number(value.minDeliveryDays)
    const max =
      value.maxDeliveryDays === '' || value.maxDeliveryDays == null
        ? null
        : Number(value.maxDeliveryDays)
    if (min != null && max != null && max < min) {
      ctx.addIssue({
        code: 'custom',
        message: 'Max days must be >= min days',
        path: ['maxDeliveryDays'],
      })
    }
  })

export type ShippingTierFormValues = z.infer<typeof shippingTierFormSchema>
