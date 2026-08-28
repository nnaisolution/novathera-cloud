import { z } from 'zod';
import { serviceStatusSchema } from '../../services/schemas/service.schema';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const createPackageInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    serviceId: z.string().min(1),
    sessionCount: z.number().int().min(1).max(100),
    priceCents: z.number().int().positive(),
    validityDays: z.number().int().positive().optional(),
    locationIds: z.array(z.string().min(1)).default([]),
    status: serviceStatusSchema.default('ACTIVE'),
  })
  .strict();

export const updatePackageInputSchema = createPackageInputSchema
  .partial()
  .extend({ id: z.string().min(1) })
  .strict();

export const listPackagesInputSchema = paginationInputSchema
  .extend({
    serviceId: z.string().min(1).optional(),
    status: serviceStatusSchema.optional(),
    sortBy: z.enum(['name', 'createdAt', 'priceCents']).default('createdAt'),
  })
  .strict();

export const packageIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export type CreatePackageInput = z.infer<typeof createPackageInputSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageInputSchema>;
export type ListPackagesInput = z.infer<typeof listPackagesInputSchema>;
