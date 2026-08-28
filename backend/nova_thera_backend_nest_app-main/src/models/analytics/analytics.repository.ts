import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../providers/database/postgres/prisma.service';

/** Order states where the customer's money has actually been captured. */
const EARNED_ORDER_STATUSES = ['PAID', 'FULFILLED', 'SHIPPED'] as const;

/** Subscription states Stripe considers currently billable. */
const LIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const;

export type RevenueRow = { at: Date; amountCents: number };

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Paid appointments in range. Bucketed on `createdAt` (when the money came
   * in) rather than `startTime`, so a course of treatments booked today does
   * not show up as revenue spread across future months.
   */
  async findServiceRevenue(from: Date, to: Date): Promise<RevenueRow[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        isTest: false,
        deletedAt: null,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        createdAt: { gte: from, lte: to },
      },
      select: { createdAt: true, priceCents: true },
    });

    return rows.map((row) => ({
      at: row.createdAt,
      amountCents: row.priceCents,
    }));
  }

  async findShopRevenue(from: Date, to: Date): Promise<RevenueRow[]> {
    const rows = await this.prisma.order.findMany({
      where: {
        isTest: false,
        status: { in: [...EARNED_ORDER_STATUSES] },
        createdAt: { gte: from, lte: to },
      },
      select: { createdAt: true, totalCents: true },
    });

    return rows.map((row) => ({
      at: row.createdAt,
      amountCents: row.totalCents,
    }));
  }

  async countBookings(from: Date, to: Date) {
    return this.prisma.booking.count({
      where: {
        isTest: false,
        deletedAt: null,
        createdAt: { gte: from, lte: to },
      },
    });
  }

  /** Booking counts per status for appointments *scheduled* in the range. */
  async bookingStatusBreakdown(from: Date, to: Date) {
    const rows = await this.prisma.booking.groupBy({
      by: ['status'],
      where: {
        isTest: false,
        deletedAt: null,
        startTime: { gte: from, lte: to },
      },
      _count: { _all: true },
    });

    return rows.map((row) => ({ status: row.status, count: row._count._all }));
  }

  async topServicesByRevenue(from: Date, to: Date, limit: number) {
    const rows = await this.prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        isTest: false,
        deletedAt: null,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        createdAt: { gte: from, lte: to },
      },
      _sum: { priceCents: true },
      _count: { _all: true },
      orderBy: { _sum: { priceCents: 'desc' } },
      take: limit,
    });

    if (rows.length === 0) return [];

    const services = await this.prisma.service.findMany({
      where: { id: { in: rows.map((row) => row.serviceId) } },
      select: { id: true, name: true, category: { select: { name: true } } },
    });
    const byId = new Map(services.map((service) => [service.id, service]));

    return rows.map((row) => ({
      serviceId: row.serviceId,
      name: byId.get(row.serviceId)?.name ?? 'Unknown service',
      categoryName: byId.get(row.serviceId)?.category?.name ?? null,
      revenueCents: row._sum.priceCents ?? 0,
      bookings: row._count._all,
    }));
  }

  async revenueByLocation(from: Date, to: Date) {
    const rows = await this.prisma.booking.groupBy({
      by: ['locationId'],
      where: {
        isTest: false,
        deletedAt: null,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        createdAt: { gte: from, lte: to },
      },
      _sum: { priceCents: true },
      _count: { _all: true },
    });

    if (rows.length === 0) return [];

    const locations = await this.prisma.location.findMany({
      where: { id: { in: rows.map((row) => row.locationId) } },
      select: { id: true, name: true },
    });
    const byId = new Map(locations.map((location) => [location.id, location]));

    return rows
      .map((row) => ({
        locationId: row.locationId,
        name: byId.get(row.locationId)?.name ?? 'Unknown location',
        revenueCents: row._sum.priceCents ?? 0,
        bookings: row._count._all,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents);
  }

  /**
   * Live subscriptions grouped by plan. Only the *current* billing period is
   * stored, so this is a point-in-time MRR — historical membership revenue
   * cannot be reconstructed from this schema.
   */
  async liveSubscriptionsByPlan() {
    const rows = await this.prisma.subscription.groupBy({
      by: ['plan'],
      where: { status: { in: [...LIVE_SUBSCRIPTION_STATUSES] } },
      _count: { _all: true },
    });

    return rows.map((row) => ({ plan: row.plan, count: row._count._all }));
  }

  async countSubscriptionsStartedBefore(cutoff: Date) {
    return this.prisma.subscription.count({
      where: {
        status: { in: [...LIVE_SUBSCRIPTION_STATUSES] },
        periodStart: { lt: cutoff },
      },
    });
  }

  async countNewCustomers(from: Date, to: Date) {
    return this.prisma.user.count({
      where: { role: 'customer', createdAt: { gte: from, lte: to } },
    });
  }

  /**
   * Splits customers who transacted in the range into first-timers and
   * returners, based on whether they had any booking before `from`.
   */
  async customerSplit(from: Date, to: Date) {
    const active = await this.prisma.booking.findMany({
      where: {
        isTest: false,
        deletedAt: null,
        createdAt: { gte: from, lte: to },
      },
      select: { customerUserId: true },
      distinct: ['customerUserId'],
    });

    if (active.length === 0) return { newCount: 0, returningCount: 0 };

    const ids = active.map((row) => row.customerUserId);
    const priorlySeen = await this.prisma.booking.findMany({
      where: {
        isTest: false,
        deletedAt: null,
        customerUserId: { in: ids },
        createdAt: { lt: from },
      },
      select: { customerUserId: true },
      distinct: ['customerUserId'],
    });

    const returningCount = priorlySeen.length;
    return { newCount: ids.length - returningCount, returningCount };
  }

  async shopOrderStats(from: Date, to: Date) {
    const result = await this.prisma.order.aggregate({
      where: {
        isTest: false,
        status: { in: [...EARNED_ORDER_STATUSES] },
        createdAt: { gte: from, lte: to },
      },
      _count: { _all: true },
      _sum: { totalCents: true, discountCents: true },
    });

    return {
      orders: result._count._all,
      revenueCents: result._sum.totalCents ?? 0,
      discountCents: result._sum.discountCents ?? 0,
    };
  }

  async countRefundedOrders(from: Date, to: Date) {
    return this.prisma.order.count({
      where: {
        isTest: false,
        status: 'REFUNDED',
        createdAt: { gte: from, lte: to },
      },
    });
  }

  // ---------------------------------------------------------------- operations

  async countAppointmentsBetween(from: Date, to: Date) {
    return this.prisma.booking.count({
      where: {
        isTest: false,
        deletedAt: null,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        startTime: { gte: from, lt: to },
      },
    });
  }

  async findAppointmentsBetween(from: Date, to: Date, limit: number) {
    return this.prisma.booking.findMany({
      where: {
        isTest: false,
        deletedAt: null,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        startTime: { gte: from, lt: to },
      },
      select: {
        id: true,
        bookingCode: true,
        startTime: true,
        status: true,
        customer: { select: { name: true } },
        service: { select: { name: true } },
        employee: { select: { firstName: true, lastName: true } },
        location: { select: { name: true } },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }

  /** Appointments whose slot has passed but which nobody has closed out. */
  async countUnresolvedBookings(now: Date) {
    return this.prisma.booking.count({
      where: {
        isTest: false,
        deletedAt: null,
        status: 'CONFIRMED',
        endTime: { lt: now },
      },
    });
  }

  async countOrdersAwaitingFulfillment() {
    return this.prisma.order.count({
      where: { isTest: false, status: 'PAID' },
    });
  }

  async findLowStockProducts(limit: number) {
    const rows = await this.prisma.inventoryLevel.findMany({
      where: {
        allowBackorder: false,
        product: { deletedAt: null, status: 'ACTIVE' },
      },
      select: {
        quantity: true,
        lowStockThreshold: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return rows
      .filter((row) => row.quantity <= row.lowStockThreshold)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, limit)
      .map((row) => ({
        productId: row.product.id,
        name: row.product.name,
        slug: row.product.slug,
        quantity: row.quantity,
        lowStockThreshold: row.lowStockThreshold,
      }));
  }

  async findExpiringCertifications(now: Date, until: Date, limit: number) {
    const rows = await this.prisma.employeeCertification.findMany({
      where: {
        expiresAt: { not: null, lte: until },
        employee: { deletedAt: null, status: 'ACTIVE' },
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { expiresAt: 'asc' },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      expiresAt: row.expiresAt as Date,
      expired: (row.expiresAt as Date) < now,
      employeeId: row.employee.id,
      employeeName: `${row.employee.firstName} ${row.employee.lastName}`,
    }));
  }

  async countTopProductsSold(from: Date, to: Date, limit: number) {
    const rows = await this.prisma.orderItem.groupBy({
      by: ['productId', 'name'],
      where: {
        order: {
          status: { in: [...EARNED_ORDER_STATUSES] },
          createdAt: { gte: from, lte: to },
        },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    return rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      units: row._sum.quantity ?? 0,
    }));
  }
}
