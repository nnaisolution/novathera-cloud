import { z } from 'zod'

export const serviceFormSchema = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  shortDescription: z.string().max(500).optional(),
  detailedDescription: z.string().max(5000).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  tags: z.string().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  durationMinutes: z.coerce.number().int().positive(),
  bufferAfterMinutes: z.coerce.number().int().min(0).default(0),
  minAdvanceBookingMinutes: z.coerce.number().int().min(0).default(0),
  maxAdvanceBookingDays: z.coerce.number().int().min(1).default(60),
  requiresConsultation: z.boolean().default(false),
  standardPrice: z.coerce.number().positive(),
  memberPrice: z.coerce.number().positive().optional(),
  taxApplicable: z.boolean().default(true),
  depositRequired: z.boolean().default(false),
  depositAmount: z.coerce.number().positive().optional(),
  anyAssignedStaff: z.boolean().default(true),
  clientCanChooseStaff: z.boolean().default(true),
  staffEmployeeIds: z.array(z.string()).default([]),
  locations: z.array(z.object({
    locationId: z.string(),
    isAvailable: z.boolean().default(true),
    priceOverride: z.coerce.number().positive().optional(),
    durationOverrideMinutes: z.coerce.number().int().positive().optional(),
    roomOrEquipment: z.string().optional(),
  })).default([]),
})

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

export const categoryFormSchema = z.object({
  name: z.string().min(1).max(200),
  iconUrl: z.string().url().optional().or(z.literal('')),
  displayOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(['ACTIVE', 'HIDDEN']).default('ACTIVE'),
})

export const packageFormSchema = z.object({
  name: z.string().min(1).max(200),
  serviceId: z.string().min(1),
  sessionCount: z.coerce.number().int().min(1),
  price: z.coerce.number().positive(),
  validityDays: z.coerce.number().int().positive().optional(),
  locationIds: z.array(z.string()).default([]),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
})
