import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import type {
  Employee,
  Location,
  Service,
  ServiceLocation,
} from 'generated/prisma/client';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { StripeConfigService } from '../../config/stripe/config.service';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import { FamilyMembersService } from '../family-members/family-members.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  hhmmToMinutes,
  localDateTimeToUtc,
  localDayBounds,
  localParts,
  overlaps,
  parseOperatingHours,
  parseSchedule,
  SLOT_STEP_MINUTES,
} from './bookings.availability';
import { BookingsRepository } from './bookings.repository';
import type {
  AvailableSlot,
  CreateBookingInput,
  CreateMyBookingInput,
  ListBookingsInput,
  ListMyBookingsInput,
  ListPaymentsInput,
  MyRescheduleBookingInput,
  RescheduleBookingInput,
} from './schemas/booking.schema';

type CallerCtx = {
  userId: string;
  role: string | null | undefined;
  headers: Headers;
};

type BookingContext = {
  service: Service;
  serviceLocation: ServiceLocation;
  location: Location;
  employee: Employee;
  durationMinutes: number;
  endTime: Date;
  priceCents: number;
  currency: string;
};

function isEagleEye(role: string | null | undefined) {
  const roleList = (role ?? '').split(',').map((r) => r.trim());
  return roleList.includes('admin') || roleList.includes('manager');
}

@Injectable()
export class BookingsService {
  constructor(
    private readonly repository: BookingsRepository,
    private readonly stripeCatalog: StripeCatalogService,
    private readonly stripeConfig: StripeConfigService,
    private readonly prisma: PrismaService,
    private readonly familyMembersService: FamilyMembersService,
    private readonly notifications: NotificationsService,
  ) {}

  private async assertBookingAccess(
    booking: { employeeId: string; locationId: string },
    callerCtx: CallerCtx,
  ) {
    if (isEagleEye(callerCtx.role)) return;
    const employee = await this.repository.findEmployeeByUserId(
      callerCtx.userId,
    );
    if (!employee) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
    }
    if (employee.locationId) {
      if (employee.locationId !== booking.locationId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
      }
      return;
    }
    if (employee.id !== booking.employeeId) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Access denied' });
    }
  }

  private async loadBookingContext(
    serviceId: string,
    locationId: string,
    employeeId: string,
    startTime: Date,
  ): Promise<BookingContext | null> {
    const data = await this.repository.findServiceForBooking(
      serviceId,
      locationId,
    );
    if (!data?.service) {
      return null;
    }

    const { service, serviceLocation } = data;
    if (!serviceLocation) {
      return null;
    }

    const employee = await this.repository.findEmployeeById(employeeId);
    if (!employee || employee.deletedAt || employee.status !== 'ACTIVE') {
      return null;
    }

    const durationMinutes =
      serviceLocation.durationOverrideMinutes ?? service.durationMinutes;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const location = await this.repository.findLocationById(locationId);
    if (!location) {
      return null;
    }

    return {
      service,
      serviceLocation,
      location,
      employee,
      durationMinutes,
      endTime,
      priceCents:
        serviceLocation.priceOverrideCents ?? service.standardPriceCents,
      currency: service.currency,
    };
  }

  private async evaluateSlot(params: {
    serviceId: string;
    locationId: string;
    employeeId: string;
    startTime: Date;
    excludeBookingId?: string;
  }): Promise<{ ok: boolean; reason?: string; context?: BookingContext }> {
    const ctx = await this.loadBookingContext(
      params.serviceId,
      params.locationId,
      params.employeeId,
      params.startTime,
    );

    if (!ctx) {
      return { ok: false, reason: 'Invalid service, location, or employee' };
    }

    const { service, serviceLocation, location, employee, endTime } = ctx;

    const data = await this.repository.findServiceForBooking(
      params.serviceId,
      params.locationId,
    );
    if (!data) {
      return { ok: false, reason: 'Service not found or inactive' };
    }

    const isAssigned = data.serviceEmployees.some(
      (se) => se.employeeId === params.employeeId,
    );
    if (!isAssigned) {
      return { ok: false, reason: 'Employee is not assigned to this service' };
    }

    if (!serviceLocation.isAvailable) {
      return { ok: false, reason: 'Service is not available at this location' };
    }

    if (employee.locationId && employee.locationId !== params.locationId) {
      return { ok: false, reason: 'Employee does not work at this location' };
    }

    const now = new Date();
    const minStart = new Date(
      now.getTime() + service.minAdvanceBookingMinutes * 60 * 1000,
    );
    const maxStart = new Date(
      now.getTime() + service.maxAdvanceBookingDays * 24 * 60 * 60 * 1000,
    );
    if (params.startTime < minStart) {
      return { ok: false, reason: 'Booking is too soon' };
    }
    if (params.startTime > maxStart) {
      return { ok: false, reason: 'Booking is too far in the future' };
    }

    const startLocal = localParts(params.startTime, location.timezone);
    const endLocal = localParts(endTime, location.timezone);
    const schedule = parseSchedule(employee.schedule);
    const daySchedule = schedule.find((d) => d.day === startLocal.weekday);
    if (!daySchedule?.isWorking) {
      return { ok: false, reason: 'Employee is not working on this day' };
    }

    const schedStart = hhmmToMinutes(daySchedule.startTime);
    const schedEnd = hhmmToMinutes(daySchedule.endTime);
    if (startLocal.minutes < schedStart || endLocal.minutes > schedEnd) {
      return { ok: false, reason: 'Time is outside employee schedule' };
    }

    const operatingHours = parseOperatingHours(location.operatingHours);
    const locDay = operatingHours.find((d) => d.day === startLocal.weekday);
    if (!locDay?.isOpen) {
      return { ok: false, reason: 'Location is closed on this day' };
    }

    const openMinutes = hhmmToMinutes(locDay.openTime);
    const closeMinutes = hhmmToMinutes(locDay.closeTime);
    if (startLocal.minutes < openMinutes || endLocal.minutes > closeMinutes) {
      return { ok: false, reason: 'Time is outside location hours' };
    }

    const buffer = Math.max(service.bufferAfterMinutes, employee.bufferMinutes);
    const blockedEnd = new Date(endTime.getTime() + buffer * 60 * 1000);
    const { dayStart, dayEnd } = localDayBounds(
      params.startTime,
      location.timezone,
    );
    const existingBookings = await this.repository.findEmployeeBookingsOnDay(
      params.employeeId,
      dayStart,
      dayEnd,
      params.excludeBookingId,
    );

    for (const existing of existingBookings) {
      const existingBlockedEnd = new Date(
        existing.endTime.getTime() + buffer * 60 * 1000,
      );
      if (
        overlaps(
          params.startTime,
          blockedEnd,
          existing.startTime,
          existingBlockedEnd,
        )
      ) {
        return { ok: false, reason: 'Time slot overlaps with another booking' };
      }
    }

    if (employee.maxDailyAppointments != null) {
      const dayCount = await this.repository.countEmployeeBookingsOnDay(
        params.employeeId,
        dayStart,
        dayEnd,
        params.excludeBookingId,
      );
      if (dayCount >= employee.maxDailyAppointments) {
        return {
          ok: false,
          reason: 'Employee has reached the daily appointment limit',
        };
      }
    }

    return { ok: true, context: ctx };
  }

  async create(input: CreateBookingInput, _callerCtx: CallerCtx) {
    try {
      const result = await this.evaluateSlot({
        serviceId: input.serviceId,
        locationId: input.locationId,
        employeeId: input.employeeId,
        startTime: input.startTime,
      });

      if (!result.ok || !result.context) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.reason ?? 'Invalid booking slot',
        });
      }

      const { durationMinutes, endTime, priceCents, currency } = result.context;

      try {
        return await this.repository.createAtomically({
          customer: { connect: { id: input.customerUserId } },
          employee: { connect: { id: input.employeeId } },
          service: { connect: { id: input.serviceId } },
          location: { connect: { id: input.locationId } },
          startTime: input.startTime,
          endTime,
          durationMinutes,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          priceCents,
          currency,
          notes: input.notes,
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'SLOT_TAKEN') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This time slot was just booked. Please choose another.',
          });
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async list(input: ListBookingsInput, callerCtx: CallerCtx) {
    if (isEagleEye(callerCtx.role)) {
      const { items, total } = await this.repository.findMany(input);
      return paginatedResponse(items, total, input.page, input.limit);
    }

    const employee = await this.repository.findEmployeeByUserId(
      callerCtx.userId,
    );
    if (!employee) {
      return paginatedResponse([], 0, input.page, input.limit);
    }

    if (employee.locationId) {
      if (input.locationId && input.locationId !== employee.locationId) {
        return paginatedResponse([], 0, input.page, input.limit);
      }
      const { items, total } = await this.repository.findMany({
        ...input,
        locationId: employee.locationId,
      });
      return paginatedResponse(items, total, input.page, input.limit);
    }

    const { items, total } = await this.repository.findMany(input, employee.id);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string, callerCtx: CallerCtx) {
    const booking = await this.repository.findById(id);
    if (!booking) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
    }
    await this.assertBookingAccess(booking, callerCtx);
    return booking;
  }

  async reschedule(input: RescheduleBookingInput, callerCtx: CallerCtx) {
    try {
      const booking = await this.getById(input.id, callerCtx);
      if (booking.status !== 'CONFIRMED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only confirmed bookings can be rescheduled',
        });
      }

      const employeeId = input.employeeId ?? booking.employeeId;
      const result = await this.evaluateSlot({
        serviceId: booking.serviceId,
        locationId: booking.locationId,
        employeeId,
        startTime: input.startTime,
        excludeBookingId: input.id,
      });

      if (!result.ok || !result.context) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.reason ?? 'Invalid booking slot',
        });
      }

      const { durationMinutes, endTime } = result.context;
      return this.repository.update(input.id, {
        startTime: input.startTime,
        endTime,
        durationMinutes,
        employee: { connect: { id: employeeId } },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async cancel(input: { id: string; reason?: string }, callerCtx: CallerCtx) {
    try {
      await this.getById(input.id, callerCtx);
      // Refunds are handled manually in the Stripe dashboard; the charge.refunded webhook syncs paymentStatus.
      return this.repository.update(input.id, {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: input.reason,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async setStatus(
    input: { id: string; status: 'COMPLETED' | 'NO_SHOW' },
    callerCtx: CallerCtx,
  ) {
    try {
      const booking = await this.getById(input.id, callerCtx);
      return this.repository.update(input.id, { status: input.status });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async availableSlots(
    input: {
      serviceId: string;
      locationId: string;
      date: Date;
      employeeId?: string;
    },
    _callerCtx: CallerCtx,
  ): Promise<AvailableSlot[]> {
    const data = await this.repository.findServiceForBooking(
      input.serviceId,
      input.locationId,
    );
    if (!data?.service || !data.serviceLocation) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Service not found or not available at location',
      });
    }

    const { service, serviceLocation } = data;
    const location = await this.repository.findLocationById(input.locationId);
    if (!location) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Location not found',
      });
    }

    const durationMinutes =
      serviceLocation.durationOverrideMinutes ?? service.durationMinutes;

    let employees: Awaited<
      ReturnType<BookingsRepository['findAssignedActiveEmployees']>
    >;
    if (input.employeeId) {
      const employee = await this.repository.findEmployeeById(input.employeeId);
      if (!employee) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Employee not found',
        });
      }
      employees = [employee];
    } else {
      employees = await this.repository.findAssignedActiveEmployees(
        input.serviceId,
        input.locationId,
      );
    }

    const weekday = localParts(input.date, location.timezone).weekday;
    const { dayStart, dayEnd } = localDayBounds(input.date, location.timezone);
    const slotMap = new Map<string, { employeeId: string; count: number }>();

    for (const employee of employees) {
      const schedule = parseSchedule(employee.schedule);
      const daySchedule = schedule.find((d) => d.day === weekday);
      if (!daySchedule?.isWorking) continue;

      const startMin = hhmmToMinutes(daySchedule.startTime);
      const endMin = hhmmToMinutes(daySchedule.endTime);
      const lastStart = endMin - durationMinutes;

      for (let m = startMin; m <= lastStart; m += SLOT_STEP_MINUTES) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        const hhmm = `${hh}:${mm}`;
        const startTime = localDateTimeToUtc(
          input.date,
          hhmm,
          location.timezone,
        );

        const result = await this.evaluateSlot({
          serviceId: input.serviceId,
          locationId: input.locationId,
          employeeId: employee.id,
          startTime,
        });

        if (!result.ok) continue;

        const count = await this.repository.countEmployeeBookingsOnDay(
          employee.id,
          dayStart,
          dayEnd,
        );

        const existing = slotMap.get(hhmm);
        if (
          !existing ||
          count < existing.count ||
          (count === existing.count && employee.id < existing.employeeId)
        ) {
          slotMap.set(hhmm, { employeeId: employee.id, count });
        }
      }
    }

    return Array.from(slotMap.entries())
      .map(([time, { employeeId }]) => ({ time, employeeId }))
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async publicStaff(input: { serviceId: string; locationId: string }) {
    const data = await this.repository.findServiceForBooking(
      input.serviceId,
      input.locationId,
    );
    if (!data?.service?.clientCanChooseStaff) {
      return [];
    }

    const employees = await this.repository.findAssignedActiveEmployees(
      input.serviceId,
      input.locationId,
    );

    return employees.map((e) => ({
      id: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      photoUrl: e.photoUrl,
      jobTitle: e.jobTitle,
    }));
  }

  async createForCustomer(input: CreateMyBookingInput, userId: string) {
    try {
      if (input.familyMemberId) {
        await this.familyMembersService.assertOwnedByUser(
          input.familyMemberId,
          userId,
        );
      }

      const result = await this.evaluateSlot({
        serviceId: input.serviceId,
        locationId: input.locationId,
        employeeId: input.employeeId,
        startTime: input.startTime,
      });

      if (!result.ok || !result.context) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.reason ?? 'Invalid booking slot',
        });
      }

      const { durationMinutes, endTime, priceCents, currency } = result.context;

      let booking: Awaited<ReturnType<BookingsRepository['createAtomically']>>;
      try {
        booking = await this.repository.createAtomically({
          customer: { connect: { id: userId } },
          employee: { connect: { id: input.employeeId } },
          service: { connect: { id: input.serviceId } },
          location: { connect: { id: input.locationId } },
          startTime: input.startTime,
          endTime,
          durationMinutes,
          status: 'CONFIRMED',
          paymentStatus: 'PENDING',
          priceCents,
          currency,
          notes: input.notes,
          ...(input.familyMemberId
            ? { familyMember: { connect: { id: input.familyMemberId } } }
            : {}),
        });
      } catch (error) {
        if (error instanceof Error && error.message === 'SLOT_TAKEN') {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This time slot was just booked. Please choose another.',
          });
        }
        throw error;
      }

      const created =
        (await this.repository.findByIdForCustomer(booking.id)) ?? booking;
      this.notifications.notifyVisitBooked(userId, booking.id);
      return created;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async listForCustomer(input: ListMyBookingsInput, userId: string) {
    const { items, total } = await this.repository.findManyForCustomer(
      userId,
      input,
    );
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getForCustomer(id: string, userId: string) {
    const booking = await this.repository.findByIdForCustomer(id);
    if (!booking || booking.customerUserId !== userId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
    }
    return booking;
  }

  async cancelForCustomer(
    input: { id: string; reason?: string },
    userId: string,
  ) {
    try {
      const booking = await this.getForCustomer(input.id, userId);
      if (booking.status !== 'CONFIRMED' || booking.startTime <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only upcoming confirmed bookings can be cancelled',
        });
      }

      return this.repository.update(input.id, {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: input.reason,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async rescheduleForCustomer(
    input: MyRescheduleBookingInput,
    userId: string,
  ) {
    try {
      const booking = await this.getForCustomer(input.id, userId);
      if (booking.status !== 'CONFIRMED' || booking.startTime <= new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only upcoming confirmed bookings can be rescheduled',
        });
      }

      const result = await this.evaluateSlot({
        serviceId: booking.serviceId,
        locationId: booking.locationId,
        employeeId: booking.employeeId,
        startTime: input.startTime,
        excludeBookingId: input.id,
      });

      if (!result.ok || !result.context) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.reason ?? 'Invalid booking slot',
        });
      }

      const { durationMinutes, endTime } = result.context;
      return this.repository.update(input.id, {
        startTime: input.startTime,
        endTime,
        durationMinutes,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async listPayments(input: ListPaymentsInput) {
    const { items, total } = await this.repository.findManyPayments(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async createCheckoutSession(bookingId: string, userId: string) {
    const booking = await this.repository.findByIdForCustomer(bookingId);
    if (!booking || booking.customerUserId !== userId) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Booking not found' });
    }
    if (booking.paymentStatus !== 'PENDING') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Booking is not awaiting payment',
      });
    }

    const stripe = this.stripeCatalog.stripe;
    if (!stripe) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Payments are not configured',
      });
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, stripeCustomerId: true },
    });
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const currency = booking.currency.toLowerCase();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: booking.priceCents,
            product_data: {
              name: booking.service.name,
              metadata: {
                bookingId: booking.id,
                serviceId: booking.serviceId,
              },
            },
          },
        },
      ],
      ...(user.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : { customer_email: user.email }),
      metadata: {
        purpose: 'booking',
        bookingId: booking.id,
      },
      success_url: this.stripeConfig.successUrlBooking,
      cancel_url: this.stripeConfig.successUrlBooking,
    });

    if (!session.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session',
      });
    }

    await this.repository.update(booking.id, {
      stripeCheckoutSessionId: session.id,
    });

    return { url: session.url };
  }
}
