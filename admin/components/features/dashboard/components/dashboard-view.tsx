'use client'

import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconClock,
  IconCoin,
  IconSparkles,
  IconUserPlus,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAnalyticsOperations,
  useAnalyticsOverview,
} from '@/components/features/dashboard/hooks/use-analytics'
import { ActionQueueCard } from '@/components/features/dashboard/components/action-queue-card'
import { BookingHealthCard } from '@/components/features/dashboard/components/booking-health-card'
import { DateRangeFilter } from '@/components/features/dashboard/components/date-range-filter'
import {
  KpiCard,
  KpiCardSkeleton,
} from '@/components/features/dashboard/components/kpi-card'
import { MembershipCard } from '@/components/features/dashboard/components/membership-card'
import { RevenueBreakdownCard } from '@/components/features/dashboard/components/revenue-breakdown-card'
import { RevenueTrendChart } from '@/components/features/dashboard/components/revenue-trend-chart'
import { TodaysScheduleCard } from '@/components/features/dashboard/components/todays-schedule-card'
import { TopServicesCard } from '@/components/features/dashboard/components/top-services-card'
import type { DateRange } from '@/components/features/dashboard/types'
import {
  formatMoney,
  formatNumber,
} from '@/components/features/dashboard/utils/format'

export function DashboardView() {
  const [range, setRange] = useState<DateRange>({ preset: '30d' })

  const overview = useAnalyticsOverview(range)
  const operations = useAnalyticsOperations()

  const showRevenue = overview.canRead
  const awaitingCustomRange =
    range.preset === 'custom' && (!range.from || !range.to)
  const revenueLoading = overview.isLoading || !overview.data
  const operationsLoading = operations.isLoading || !operations.data

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Overview</h1>
          <p className='text-muted-foreground text-sm'>
            {showRevenue
              ? 'How the clinic is performing'
              : "What's happening today"}
          </p>
        </div>

        {showRevenue ? (
          <DateRangeFilter value={range} onChange={setRange} />
        ) : null}
      </div>

      {showRevenue && overview.isError ? (
        <Alert variant='destructive'>
          <AlertTitle>Could not load analytics</AlertTitle>
          <AlertDescription>
            {overview.error instanceof Error
              ? overview.error.message
              : 'Something went wrong.'}
          </AlertDescription>
        </Alert>
      ) : null}

      {showRevenue && awaitingCustomRange ? (
        <Alert>
          <AlertTitle>Pick an end date</AlertTitle>
          <AlertDescription>
            Choose both a start and end date to see the custom range.
          </AlertDescription>
        </Alert>
      ) : null}

      {/* ---------------------------------- revenue: admin and manager only */}
      {showRevenue && revenueLoading ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <KpiCardSkeleton key={index} />
            ))}
          </div>
          <div className='grid gap-6 lg:grid-cols-3'>
            <Skeleton className='h-96 w-full rounded-xl lg:col-span-2' />
            <Skeleton className='h-96 w-full rounded-xl' />
          </div>
        </>
      ) : null}

      {showRevenue && !revenueLoading && overview.data ? (
        <>
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <KpiCard
              index={0}
              icon={IconCoin}
              label='Revenue'
              value={formatMoney(overview.data.kpis.revenueCents.value)}
              changePct={overview.data.kpis.revenueCents.changePct}
            />
            <KpiCard
              index={1}
              icon={IconCalendarEvent}
              label='Bookings'
              value={formatNumber(overview.data.kpis.bookings.value)}
              changePct={overview.data.kpis.bookings.changePct}
            />
            <KpiCard
              index={2}
              icon={IconSparkles}
              label='Active members'
              value={formatNumber(overview.data.kpis.activeMembers.value)}
              changePct={overview.data.kpis.activeMembers.changePct}
            />
            <KpiCard
              index={3}
              icon={IconUserPlus}
              label='New customers'
              value={formatNumber(overview.data.kpis.newCustomers.value)}
              changePct={overview.data.kpis.newCustomers.changePct}
            />
          </div>

          <div className='grid gap-6 lg:grid-cols-3'>
            <div className='lg:col-span-2'>
              <RevenueTrendChart
                data={overview.data.trend}
                totalCents={overview.data.revenue.totalCents}
              />
            </div>
            <RevenueBreakdownCard
              servicesCents={overview.data.revenue.servicesCents}
              shopCents={overview.data.revenue.shopCents}
              mrrCents={overview.data.revenue.mrrCents}
            />
          </div>

          <div className='grid gap-6 lg:grid-cols-3'>
            <TopServicesCard services={overview.data.topServices} />
            <BookingHealthCard health={overview.data.bookingHealth} />
            <MembershipCard
              activeMembers={overview.data.membership.activeMembers}
              mrrCents={overview.data.membership.mrrCents}
              mix={overview.data.membership.mix}
            />
          </div>
        </>
      ) : null}

      {/* --------------------------- operations: anyone with booking access */}
      {operations.canRead && operationsLoading ? (
        <div className='grid gap-6 lg:grid-cols-2'>
          <Skeleton className='h-80 w-full rounded-xl' />
          <Skeleton className='h-80 w-full rounded-xl' />
        </div>
      ) : null}

      {operations.canRead && !operationsLoading && operations.data ? (
        <>
          {/* Without the revenue row above, staff would open to a nearly empty
              page — give them their own headline numbers instead. */}
          {!showRevenue ? (
            <div className='grid gap-4 sm:grid-cols-3'>
              <KpiCard
                index={0}
                icon={IconCalendarEvent}
                label='Today'
                value={formatNumber(operations.data.appointments.today)}
              />
              <KpiCard
                index={1}
                icon={IconClock}
                label='Still to come today'
                value={formatNumber(
                  operations.data.appointments.remainingToday,
                )}
              />
              <KpiCard
                index={2}
                icon={IconCalendarPlus}
                label='Tomorrow'
                value={formatNumber(operations.data.appointments.tomorrow)}
              />
            </div>
          ) : null}

          <div className='grid gap-6 lg:grid-cols-2'>
            <TodaysScheduleCard
              schedule={operations.data.schedule}
              remainingToday={operations.data.appointments.remainingToday}
              timezone={operations.data.timezone}
            />
            <ActionQueueCard
              unresolvedBookings={operations.data.queue.unresolvedBookings}
              ordersAwaitingFulfillment={
                operations.data.queue.ordersAwaitingFulfillment
              }
              lowStock={operations.data.queue.lowStock}
              expiringCertifications={
                operations.data.queue.expiringCertifications
              }
            />
          </div>
        </>
      ) : null}

      {!overview.canRead && !operations.canRead ? (
        <Alert>
          <AlertTitle>Nothing to show</AlertTitle>
          <AlertDescription>
            Your role does not have access to dashboard data. Use the sidebar to
            reach the sections you can work with.
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
