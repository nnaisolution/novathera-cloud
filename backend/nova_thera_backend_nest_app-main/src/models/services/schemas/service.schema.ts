import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const serviceStatusSchema = z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']);

export const serviceLocationInputSchema = z
  .object({
    locationId: z.string().min(1),
    isAvailable: z.boolean().default(true),
    priceOverrideCents: z.number().int().positive().optional(),
    durationOverrideMinutes: z.number().int().positive().optional(),
    roomOrEquipment: z.string().max(200).optional(),
  })
  .strict();

const serviceBaseSchema = z
  .object({
    name: z.string().min(1).max(200),
    categoryId: z.string().min(1),
    shortDescription: z.string().max(500).optional(),
    detailedDescription: z.string().max(5000).optional(),
    imageUrl: z.string().url().optional(),
    tags: z.array(z.string().max(50)).max(10).default([]),
    status: serviceStatusSchema.default('DRAFT'),
    durationMinutes: z.number().int().positive().max(480),
    bufferAfterMinutes: z.number().int().min(0).max(120).default(0),
    minAdvanceBookingMinutes: z.number().int().min(0).default(0),
    maxAdvanceBookingDays: z.number().int().min(1).max(365).default(60),
    requiresConsultation: z.boolean().default(false),
    standardPriceCents: z.number().int().positive(),
    memberPriceCents: z.number().int().positive().optional(),
    currency: z.string().length(3).default('CAD'),
    taxApplicable: z.boolean().default(true),
    depositRequired: z.boolean().default(false),
    depositAmountCents: z.number().int().positive().optional(),
    anyAssignedStaff: z.boolean().default(true),
    clientCanChooseStaff: z.boolean().default(true),
    locations: z.array(serviceLocationInputSchema).default([]),
    staffEmployeeIds: z.array(z.string().min(1)).default([]),
  })
  .strict();

function withServiceRefinements<T extends z.ZodType>(schema: T) {
  return schema.superRefine((value, ctx) => {
    const v = value as z.infer<typeof serviceBaseSchema>;
    if (
      v.memberPriceCents !== undefined &&
      v.standardPriceCents !== undefined &&
      v.memberPriceCents > v.standardPriceCents
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Member price cannot exceed standard price',
        path: ['memberPriceCents'],
      });
    }
    if (v.depositRequired && !v.depositAmountCents) {
      ctx.addIssue({
        code: 'custom',
        message: 'Deposit amount is required when deposit is enabled',
        path: ['depositAmountCents'],
      });
    }
  });
}

export const createServiceInputSchema =
  withServiceRefinements(serviceBaseSchema);
export const updateServiceInputSchema = withServiceRefinements(
  serviceBaseSchema
    .partial()
    .extend({ id: z.string().min(1) })
    .strict(),
);

export const listServicesInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    categoryId: z.string().min(1).optional(),
    status: serviceStatusSchema.optional(),
    locationId: z.string().min(1).optional(),
    sortBy: z.enum(['name', 'createdAt', 'status']).default('createdAt'),
  })
  .strict();

export const serviceIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export const publicListServicesInputSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    locationId: z.string().min(1).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
  })
  .strict();

export const publicGetServiceBySlugInputSchema = z
  .object({ slug: z.string().min(1) })
  .strict();

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;
export type ListServicesInput = z.infer<typeof listServicesInputSchema>;
export type PublicListServicesInput = z.infer<
  typeof publicListServicesInputSchema
>;
export type PublicGetServiceBySlugInput = z.infer<
  typeof publicGetServiceBySlugInputSchema
>;
