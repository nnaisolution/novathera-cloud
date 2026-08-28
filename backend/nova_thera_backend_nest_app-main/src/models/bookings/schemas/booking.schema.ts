import { z } from 'zod';
import { paginationInputSchema } from '../../../common/schemas/pagination.schema';

export const bookingStatusSchema = z.enum([
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const createBookingInputSchema = z
  .object({
    customerUserId: z.string().min(1),
    serviceId: z.string().min(1),
    employeeId: z.string().min(1),
    locationId: z.string().min(1),
    startTime: z.coerce.date(),
    notes: z.string().max(1000).optional(),
    familyMemberId: z.string().min(1).optional(),
  })
  .strict();

export const rescheduleBookingInputSchema = z
  .object({
    id: z.string().min(1),
    startTime: z.coerce.date(),
    employeeId: z.string().min(1).optional(),
  })
  .strict();

export const cancelBookingInputSchema = z
  .object({
    id: z.string().min(1),
    reason: z.string().max(1000).optional(),
  })
  .strict();

// Customer self-service reschedule: same provider, new time only —
// unlike the staff `reschedule` procedure, employeeId is not caller-controlled.
export const myRescheduleBookingInputSchema = z
  .object({
    id: z.string().min(1),
    startTime: z.coerce.date(),
  })
  .strict();

export const bookingIdInputSchema = z
  .object({ id: z.string().min(1) })
  .strict();

export const setBookingStatusInputSchema = z
  .object({
    id: z.string().min(1),
    status: z.enum(['COMPLETED', 'NO_SHOW']),
  })
  .strict();

export const listBookingsInputSchema = paginationInputSchema
  .extend({
    employeeId: z.string().min(1).optional(),
    locationId: z.string().min(1).optional(),
    serviceId: z.string().min(1).optional(),
    status: bookingStatusSchema.optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['startTime', 'createdAt']).default('startTime'),
  })
  .strict();

export const availableSlotsInputSchema = z
  .object({
    serviceId: z.string().min(1),
    locationId: z.string().min(1),
    date: z.coerce.date(),
    employeeId: z.string().min(1).optional(),
  })
  .strict();

export const createMyBookingInputSchema = createBookingInputSchema.omit({
  customerUserId: true,
});

export const publicStaffInputSchema = z
  .object({
    serviceId: z.string().min(1),
    locationId: z.string().min(1),
  })
  .strict();

export const listMyBookingsInputSchema = paginationInputSchema
  .extend({
    scope: z.enum(['upcoming', 'past', 'all']).default('all'),
  })
  .strict();

export const listPaymentsInputSchema = paginationInputSchema
  .extend({
    paymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED']).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    search: z.string().max(200).optional(),
  })
  .strict();

export const createCheckoutSessionInputSchema = z
  .object({
    bookingId: z.string().min(1),
  })
  .strict();

export type AvailableSlot = { time: string; employeeId: string };

export type CreateBookingInput = z.infer<typeof createBookingInputSchema>;
export type CreateMyBookingInput = z.infer<typeof createMyBookingInputSchema>;
export type RescheduleBookingInput = z.infer<
  typeof rescheduleBookingInputSchema
>;
export type MyRescheduleBookingInput = z.infer<
  typeof myRescheduleBookingInputSchema
>;
export type ListBookingsInput = z.infer<typeof listBookingsInputSchema>;
export type ListMyBookingsInput = z.infer<typeof listMyBookingsInputSchema>;
export type ListPaymentsInput = z.infer<typeof listPaymentsInputSchema>;
export type CreateBookingCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionInputSchema
>;
