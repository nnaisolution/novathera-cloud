import { Injectable } from '@nestjs/common';
import {
  DEFAULT_REPORTING_TIMEZONE,
  addDays,
  startOfZonedDay,
  zonedDayKey,
  zonedDayKeysBetween,
} from '../../common/helpers/timezone';
import { MEMBERSHIP_PLAN_CATALOG } from '../membership/membership-plans';
import { SettingsService } from '../settings/settings.service';
import { AnalyticsRepository, type RevenueRow } from './analytics.repository';
import type { AnalyticsRangeInput } from './schemas/analytics.schema';

const PRESET_DAYS: Record<string, number> = { '30d': 30, '60d': 60, '90d': 90 };

export type ResolvedRange = {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  days: number;
  timezone: string;
};

/** Null change means "no prior activity to compare against", not 0%. */
function delta(current: number, previous: number) {
  const changePct =
    previous === 0 ? null : ((current - previous) / previous) * 100;
  return { value: current, previous, changePct };
}

function sum(rows: RevenueRow[]) {
  return rows.reduce((total, row) => total + row.amountCents, 0);
}

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly settings: SettingsService,
  ) {}

  /** Clinic reporting zone, admin-configurable via business settings. */
  private async timezoneOf(): Promise<string> {
    const business = await this.settings.get('business');
    return business.timezone || DEFAULT_REPORTING_TIMEZONE;
  }

  resolveRange(input: AnalyticsRangeInput, timezone: string): ResolvedRange {
    const now = new Date();
    let from: Date;
    let to: Date;

    if (input.preset === 'custom') {
      // Validated as present by the schema.
      from = startOfZonedDay(input.from as Date, timezone);
      to = addDays(startOfZonedDay(input.to as Date, timezone), 1);
    } else {
      const days = PRESET_DAYS[input.preset] ?? 30;
      to = addDays(startOfZonedDay(now, timezone), 1);
      from = startOfZonedDay(addDays(to, -days), timezone);
    }

    const spanMs = to.getTime() - from.getTime();
    const days = Math.max(1, Math.round(spanMs / (24 * 60 * 60 * 1000)));

    return {
      from,
      to,
      previousFrom: new Date(from.getTime() - spanMs),
      previousTo: from,
      days,
      timezone,
    };
  }

  private bucketByDay(rows: RevenueRow[], timezone: string) {
    const buckets = new Map<string, number>();
    for (const row of rows) {
      const key = zonedDayKey(row.at, timezone);
      buckets.set(key, (buckets.get(key) ?? 0) + row.amountCents);
    }
    return buckets;
  }

  async overview(input: AnalyticsRangeInput) {
    const [business, dashboard] = await Promise.all([
      this.settings.get('business'),
      this.settings.get('dashboard'),
    ]);
    const timezone = business.timezone || DEFAULT_REPORTING_TIMEZONE;
    const range = this.resolveRange(input, timezone);

    const [
      serviceRevenue,
      shopRevenue,
      priorServiceRevenue,
      priorShopRevenue,
      bookings,
      priorBookings,
      newCustomers,
      priorNewCustomers,
      subscriptionsByPlan,
      priorMemberCount,
      topServices,
      byLocation,
      statusBreakdown,
      orderStats,
      refundedOrders,
      customerSplit,
      topProducts,
    ] = await Promise.all([
      this.repository.findServiceRevenue(range.from, range.to),
      this.repository.findShopRevenue(range.from, range.to),
      this.repository.findServiceRevenue(range.previousFrom, range.previousTo),
      this.repository.findShopRevenue(range.previousFrom, range.previousTo),
      this.repository.countBookings(range.from, range.to),
      this.repository.countBookings(range.previousFrom, range.previousTo),
      this.repository.countNewCustomers(range.from, range.to),
      this.repository.countNewCustomers(range.previousFrom, range.previousTo),
      this.repository.liveSubscriptionsByPlan(),
      this.repository.countSubscriptionsStartedBefore(range.from),
      this.repository.topServicesByRevenue(range.from, range.to, 8),
      this.repository.revenueByLocation(range.from, range.to),
      this.repository.bookingStatusBreakdown(range.from, range.to),
      this.repository.shopOrderStats(range.from, range.to),
      this.repository.countRefundedOrders(range.from, range.to),
      this.repository.customerSplit(range.from, range.to),
      this.repository.countTopProductsSold(range.from, range.to, 5),
    ]);

    const serviceBuckets = this.bucketByDay(serviceRevenue, timezone);
    const shopBuckets = this.bucketByDay(shopRevenue, timezone);

    const trend = zonedDayKeysBetween(
      range.from,
      // `to` is exclusive; step back inside it for the last label.
      new Date(range.to.getTime() - 1),
      timezone,
    ).map((date) => ({
      date,
      servicesCents: serviceBuckets.get(date) ?? 0,
      shopCents: shopBuckets.get(date) ?? 0,
    }));

    const servicesCents = sum(serviceRevenue);
    const shopCents = sum(shopRevenue);
    const totalCents = servicesCents + shopCents;
    const priorTotalCents = sum(priorServiceRevenue) + sum(priorShopRevenue);

    const membershipMix = Object.values(MEMBERSHIP_PLAN_CATALOG).map((plan) => {
      const live = subscriptionsByPlan.find((row) => row.plan === plan.name);
      const count = live?.count ?? 0;
      return {
        planId: plan.id,
        name: plan.name,
        count,
        mrrCents: count * plan.priceCents,
      };
    });

    const activeMembers = membershipMix.reduce((n, plan) => n + plan.count, 0);
    const mrrCents = membershipMix.reduce((n, plan) => n + plan.mrrCents, 0);

    const statusCount = (status: string) =>
      statusBreakdown.find((row) => row.status === status)?.count ?? 0;

    const scheduled = statusBreakdown.reduce((n, row) => n + row.count, 0);
    const noShow = statusCount('NO_SHOW');
    const cancelled = statusCount('CANCELLED');

    return {
      range: {
        from: range.from,
        to: range.to,
        days: range.days,
        timezone: range.timezone,
      },
      currency: business.currency,
      thresholds: {
        noShowWarningPercent: dashboard.noShowWarningPercent,
        cancellationWarningPercent: dashboard.cancellationWarningPercent,
      },
      kpis: {
        revenueCents: delta(totalCents, priorTotalCents),
        bookings: delta(bookings, priorBookings),
        activeMembers: delta(activeMembers, priorMemberCount),
        newCustomers: delta(newCustomers, priorNewCustomers),
      },
      revenue: {
        totalCents,
        servicesCents,
        shopCents,
        mrrCents,
        discountCents: orderStats.discountCents,
        averageOrderValueCents:
          orderStats.orders === 0
            ? 0
            : Math.round(orderStats.revenueCents / orderStats.orders),
        orders: orderStats.orders,
        refundedOrders,
      },
      trend,
      topServices,
      byLocation,
      topProducts,
      membership: { activeMembers, mrrCents, mix: membershipMix },
      bookingHealth: {
        scheduled,
        completed: statusCount('COMPLETED'),
        confirmed: statusCount('CONFIRMED'),
        cancelled,
        noShow,
        noShowRate: scheduled === 0 ? 0 : (noShow / scheduled) * 100,
        cancellationRate: scheduled === 0 ? 0 : (cancelled / scheduled) * 100,
      },
      customerSplit,
    };
  }

  /**
   * The run-the-clinic half of the dashboard. `capabilities` reflects what the
   * caller is actually allowed to see — a receptionist has `booking:read` but
   * no business seeing stock levels or staff compliance.
   */
  async operations(capabilities: {
    orders: boolean;
    products: boolean;
    employees: boolean;
  }) {
    const now = new Date();
    const [timezone, dashboard] = await Promise.all([
      this.timezoneOf(),
      this.settings.get('dashboard'),
    ]);

    const todayStart = startOfZonedDay(now, timezone);
    const tomorrowStart = startOfZonedDay(addDays(todayStart, 1.05), timezone);
    const dayAfterStart = startOfZonedDay(addDays(tomorrowStart, 1.05), timezone);

    const [today, tomorrow, remainingToday, schedule, unresolvedBookings] =
      await Promise.all([
        this.repository.countAppointmentsBetween(todayStart, tomorrowStart),
        this.repository.countAppointmentsBetween(tomorrowStart, dayAfterStart),
        this.repository.countAppointmentsBetween(now, tomorrowStart),
        this.repository.findAppointmentsBetween(now, tomorrowStart, 8),
        this.repository.countUnresolvedBookings(now),
      ]);

    const [ordersAwaitingFulfillment, lowStock, expiringCertifications] =
      await Promise.all([
        capabilities.orders
          ? this.repository.countOrdersAwaitingFulfillment()
          : Promise.resolve(null),
        capabilities.products
          ? this.repository.findLowStockProducts(dashboard.lowStockPanelLimit)
          : Promise.resolve(null),
        capabilities.employees
          ? this.repository.findExpiringCertifications(
              now,
              addDays(now, dashboard.certificationWarningDays),
              dashboard.lowStockPanelLimit,
            )
          : Promise.resolve(null),
      ]);

    return {
      timezone,
      thresholds: {
        noShowWarningPercent: dashboard.noShowWarningPercent,
        cancellationWarningPercent: dashboard.cancellationWarningPercent,
      },
      appointments: { today, tomorrow, remainingToday },
      schedule,
      queue: {
        unresolvedBookings,
        ordersAwaitingFulfillment,
        lowStock,
        expiringCertifications,
      },
    };
  }
}
