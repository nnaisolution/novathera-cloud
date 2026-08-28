import { z } from 'zod'

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)

export const operatingDaySchema = z
  .object({
    day: z.enum(DAYS_OF_WEEK),
    isOpen: z.boolean(),
    openTime: timeSchema,
    closeTime: timeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.isOpen && value.closeTime <= value.openTime) {
      ctx.addIssue({
        code: 'custom',
        message: 'Close time must be after open time',
        path: ['closeTime'],
      })
    }
  })

export const operatingHoursSchema = z.array(operatingDaySchema).length(7)

export const locationStatusSchema = z.enum(['OPEN', 'COMING_SOON', 'CLOSED'])

export const locationFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  addressLine1: z.string().min(1, 'Address is required').max(300),
  addressLine2: z.string().max(300).optional(),
  city: z.string().min(1, 'City is required').max(100),
  province: z.string().min(1, 'Province is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().length(2).default('CA'),
  phone: z.string().max(30).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  googleMapsUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  timezone: z.string().default('America/Edmonton'),
  operatingHours: operatingHoursSchema,
  status: locationStatusSchema.default('OPEN'),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

export const defaultOperatingHours = DAYS_OF_WEEK.map((day) => ({
  day,
  isOpen: day !== 'sunday',
  openTime: '09:00',
  closeTime: '17:00',
}))

export const defaultLocationFormValues: LocationFormValues = {
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'CA',
  phone: '',
  email: '',
  googleMapsUrl: '',
  timezone: 'America/Edmonton',
  operatingHours: defaultOperatingHours,
  status: 'OPEN',
}
