import {
  permissionProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../../trpc/trpc';
import { BookingsService } from './bookings.service';
import {
  availableSlotsInputSchema,
  bookingIdInputSchema,
  cancelBookingInputSchema,
  createBookingInputSchema,
  createCheckoutSessionInputSchema,
  createMyBookingInputSchema,
  listBookingsInputSchema,
  listMyBookingsInputSchema,
  listPaymentsInputSchema,
  myRescheduleBookingInputSchema,
  publicStaffInputSchema,
  rescheduleBookingInputSchema,
  setBookingStatusInputSchema,
} from './schemas/booking.schema';

function callerCtx(ctx: {
  user: { id: string; role?: string | null };
  headers: Headers;
}) {
  return {
    userId: ctx.user.id,
    role: ctx.user.role,
    headers: ctx.headers,
  };
}

export function createBookingsRouter(service: BookingsService) {
  return router({
    publicAvailableSlots: publicProcedure
      .input(availableSlotsInputSchema)
      .query(({ input }) =>
        service.availableSlots(input, {
          userId: '',
          role: null,
          headers: new Headers(),
        }),
      ),

    publicStaff: publicProcedure
      .input(publicStaffInputSchema)
      .query(({ input }) => service.publicStaff(input)),

    myCreate: protectedProcedure
      .input(createMyBookingInputSchema)
      .mutation(({ input, ctx }) =>
        service.createForCustomer(input, ctx.user.id),
      ),

    myList: protectedProcedure
      .input(listMyBookingsInputSchema)
      .query(({ input, ctx }) => service.listForCustomer(input, ctx.user.id)),

    myGetById: protectedProcedure
      .input(bookingIdInputSchema)
      .query(({ input, ctx }) => service.getForCustomer(input.id, ctx.user.id)),

    myCancel: protectedProcedure
      .input(cancelBookingInputSchema)
      .mutation(({ input, ctx }) =>
        service.cancelForCustomer(input, ctx.user.id),
      ),

    myReschedule: protectedProcedure
      .input(myRescheduleBookingInputSchema)
      .mutation(({ input, ctx }) =>
        service.rescheduleForCustomer(input, ctx.user.id),
      ),

    createCheckoutSession: protectedProcedure
      .input(createCheckoutSessionInputSchema)
      .mutation(({ input, ctx }) =>
        service.createCheckoutSession(input.bookingId, ctx.user.id),
      ),

    listPayments: permissionProcedure('payment', 'read')
      .input(listPaymentsInputSchema)
      .query(({ input }) => service.listPayments(input)),

    list: permissionProcedure('booking', 'read')
      .input(listBookingsInputSchema)
      .query(({ input, ctx }) => service.list(input, callerCtx(ctx))),

    getById: permissionProcedure('booking', 'read')
      .input(bookingIdInputSchema)
      .query(({ input, ctx }) => service.getById(input.id, callerCtx(ctx))),

    availableSlots: permissionProcedure('booking', 'create')
      .input(availableSlotsInputSchema)
      .query(({ input, ctx }) => service.availableSlots(input, callerCtx(ctx))),

    create: permissionProcedure('booking', 'create')
      .input(createBookingInputSchema)
      .mutation(({ input, ctx }) => service.create(input, callerCtx(ctx))),

    reschedule: permissionProcedure('booking', 'reschedule')
      .input(rescheduleBookingInputSchema)
      .mutation(({ input, ctx }) => service.reschedule(input, callerCtx(ctx))),

    cancel: permissionProcedure('booking', 'cancel')
      .input(cancelBookingInputSchema)
      .mutation(({ input, ctx }) => service.cancel(input, callerCtx(ctx))),

    setStatus: permissionProcedure('booking', 'setStatus')
      .input(setBookingStatusInputSchema)
      .mutation(({ input, ctx }) => service.setStatus(input, callerCtx(ctx))),
  });
}
