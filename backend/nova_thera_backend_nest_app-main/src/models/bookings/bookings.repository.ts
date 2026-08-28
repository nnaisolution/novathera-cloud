import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  ListBookingsInput,
  ListMyBookingsInput,
  ListPaymentsInput,
} from './schemas/booking.schema';

const bookingInclude = {
  employee: true,
  service: true,
  location: true,
  customer: { select: { id: true, name: true, email: true } },
} satisfies Prisma.BookingInclude;

const customerBookingInclude = {
  service: {
    select: {
      id: true,
      name: true,
      stripeProductId: true,
      stripePriceId: true,
    },
  },
  location: { select: { id: true, name: true, timezone: true } },
  employee: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.BookingInclude;

@Injectable()
export class BookingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getNextBookingCode() {
    const rows = await this.prisma.$queryRaw<Array<{ nextval: bigint }>>`
      SELECT nextval('booking_code_seq') AS nextval
    `;
    return `BK-${String(rows[0].nextval).padStart(4, '0')}`;
  }

  async findById(id: string) {
    return this.prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: bookingInclude,
    });
  }

  async findByIdForCustomer(id: string) {
    return this.prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: customerBookingInclude,
    });
  }

  async findManyForCustomer(userId: string, input: ListMyBookingsInput) {
    const now = new Date();
    const scopeWhere: Prisma.BookingWhereInput =
      input.scope === 'upcoming'
        ? { startTime: { gte: now }, status: 'CONFIRMED' }
        : input.scope === 'past'
          ? {
              OR: [
                { startTime: { lt: now } },
                { status: { not: 'CONFIRMED' } },
              ],
            }
          : {};

    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      customerUserId: userId,
      ...scopeWhere,
    };

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: customerBookingInclude,
        orderBy: { startTime: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findManyPayments(input: ListPaymentsInput) {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      paymentStatus: { not: 'NONE' },
      ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      ...(input.from || input.to
        ? {
            startTime: {
              ...(input.from ? { gte: input.from } : {}),
              ...(input.to ? { lte: input.to } : {}),
            },
          }
        : {}),
      ...(input.search
        ? {
            OR: [
              { bookingCode: { contains: input.search, mode: 'insensitive' } },
              {
                customer: {
                  is: {
                    OR: [
                      { name: { contains: input.search, mode: 'insensitive' } },
                      {
                        email: { contains: input.search, mode: 'insensitive' },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        select: {
          id: true,
          bookingCode: true,
          startTime: true,
          priceCents: true,
          currency: true,
          status: true,
          paymentStatus: true,
          stripePaymentIntentId: true,
          createdAt: true,
          customer: { select: { name: true, email: true } },
          service: { select: { name: true } },
          location: { select: { name: true } },
        },
        orderBy: { startTime: 'desc' },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findMany(input: ListBookingsInput, scopeEmployeeId?: string) {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      ...(scopeEmployeeId ? { employeeId: scopeEmployeeId } : {}),
      ...(input.employeeId ? { employeeId: input.employeeId } : {}),
      ...(input.locationId ? { locationId: input.locationId } : {}),
      ...(input.serviceId ? { serviceId: input.serviceId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.from || input.to
        ? {
            startTime: {
              ...(input.from ? { gte: input.from } : {}),
              ...(input.to ? { lte: input.to } : {}),
            },
          }
        : {}),
      ...(input.search
        ? {
            customer: {
              is: {
                OR: [
                  { name: { contains: input.search, mode: 'insensitive' } },
                  { email: { contains: input.search, mode: 'insensitive' } },
                ],
              },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: bookingInclude,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    return { items, total };
  }

  async findEmployeeByUserId(userId: string) {
    return this.prisma.employee.findUnique({ where: { userId } });
  }

  async findEmployeeById(id: string) {
    return this.prisma.employee.findUnique({ where: { id } });
  }

  async findServiceForBooking(serviceId: string, locationId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, deletedAt: null, status: 'ACTIVE' },
      include: {
        locations: { where: { locationId } },
        staff: true,
      },
    });

    if (!service) return null;

    return {
      service,
      serviceLocation: service.locations[0] ?? null,
      serviceEmployees: service.staff,
    };
  }

  async findAssignedActiveEmployees(serviceId: string, locationId: string) {
    const assignments = await this.prisma.serviceEmployee.findMany({
      where: { serviceId },
      include: {
        employee: true,
      },
    });

    return assignments
      .map((a) => a.employee)
      .filter(
        (e) =>
          e.status === 'ACTIVE' &&
          e.deletedAt === null &&
          (e.locationId === locationId || e.locationId === null),
      );
  }

  async findEmployeeBookingsOnDay(
    employeeId: string,
    dayStart: Date,
    dayEnd: Date,
    excludeBookingId?: string,
  ) {
    return this.prisma.booking.findMany({
      where: {
        employeeId,
        startTime: { gte: dayStart, lt: dayEnd },
        status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] },
        deletedAt: null,
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
      include: { service: true },
    });
  }

  async findLocationById(id: string) {
    return this.prisma.location.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async countEmployeeBookingsOnDay(
    employeeId: string,
    dayStart: Date,
    dayEnd: Date,
    excludeBookingId?: string,
  ) {
    return this.prisma.booking.count({
      where: {
        employeeId,
        startTime: { gte: dayStart, lt: dayEnd },
        status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] },
        deletedAt: null,
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
    });
  }

  async createAtomically(data: Omit<Prisma.BookingCreateInput, 'bookingCode'>) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const overlapping = await tx.booking.findFirst({
            where: {
              employeeId: (data.employee as { connect: { id: string } }).connect
                .id,
              status: { in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW'] },
              deletedAt: null,
              startTime: { lt: data.endTime as Date },
              endTime: { gt: data.startTime as Date },
            },
            select: { id: true },
          });

          if (overlapping) {
            throw new Error('SLOT_TAKEN');
          }

          const rows = await tx.$queryRaw<Array<{ nextval: bigint }>>`
            SELECT nextval('booking_code_seq') AS nextval
          `;
          const bookingCode = `BK-${String(rows[0].nextval).padStart(4, '0')}`;

          return tx.booking.create({
            data: { ...data, bookingCode },
            include: bookingInclude,
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'SLOT_TAKEN') {
        throw error;
      }
      // Unique/exclusion constraint races surface as Prisma errors — map SLOT_TAKEN for callers
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === 'P2002' || error.code === 'P2034')
      ) {
        throw new Error('SLOT_TAKEN');
      }
      throw error;
    }
  }

  async create(data: Prisma.BookingCreateInput) {
    return this.prisma.booking.create({ data, include: bookingInclude });
  }

  async update(id: string, data: Prisma.BookingUpdateInput) {
    return this.prisma.booking.update({
      where: { id },
      data,
      include: bookingInclude,
    });
  }
}
