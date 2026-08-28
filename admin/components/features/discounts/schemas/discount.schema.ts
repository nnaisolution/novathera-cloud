import { z } from 'zod'

export const discountFormSchema = z
  .object({
    code: z.string().min(1).max(50),
    type: z.enum(['PERCENT', 'FIXED']),
    percentOff: z.coerce.number().int().min(1).max(100).optional(),
    amountOff: z.coerce.number().positive().optional(),
    expiresAt: z.string().optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.type === 'PERCENT' && value.percentOff == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Percent off is required',
        path: ['percentOff'],
      })
    }
    if (value.type === 'FIXED' && value.amountOff == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Amount off is required',
        path: ['amountOff'],
      })
    }
  })

export type DiscountFormValues = z.infer<typeof discountFormSchema>
