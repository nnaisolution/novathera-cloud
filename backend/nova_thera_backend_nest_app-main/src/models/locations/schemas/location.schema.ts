import { z } from 'zod';
import { operatingHoursSchema } from '../../../common/schemas/schedule.schema';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const locationStatusSchema = z.enum(['OPEN', 'COMING_SOON', 'CLOSED']);

export const createLocationInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    addressLine1: z.string().min(1).max(300),
    addressLine2: z.string().max(300).optional(),
    city: z.string().min(1).max(100),
    province: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(2).max(2).default('CA'),
    phone: z.string().max(30).optional(),
    email: z.string().email().optional(),
    googleMapsUrl: z.string().url().optional(),
    timezone: z.string().min(1).max(100).default('America/Edmonton'),
    operatingHours: operatingHoursSchema,
    status: locationStatusSchema.default('OPEN'),
  })
  .strict();

export const updateLocationInputSchema = createLocationInputSchema
  .partial()
  .extend({
    id: z.string().min(1),
  })
  .strict();

export const listLocationsInputSchema = paginationInputSchema
  .extend({
    search: z.string().max(200).optional(),
    status: locationStatusSchema.optional(),
    sortBy: z
      .enum(['name', 'city', 'createdAt', 'status'])
      .default('createdAt'),
  })
  .strict();

export const locationIdInputSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const publicListLocationsInputSchema = z
  .object({
    city: z.string().max(100).optional(),
    search: z.string().max(200).optional(),
  })
  .strict();

export type CreateLocationInput = z.infer<typeof createLocationInputSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationInputSchema>;
export type ListLocationsInput = z.infer<typeof listLocationsInputSchema>;
export type PublicListLocationsInput = z.infer<
  typeof publicListLocationsInputSchema
>;
