'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  formatNumber,
  formatPercent,
} from '@/components/features/dashboard/utils/format'

type BookingHealth = {
  scheduled: number
  completed: number
  confirmed: number
  cancelled: number
  noShow: number
  noShowRate: number
  cancellationRate: number
}

/** Above this, the rate is worth flagging rather than just reporting. */
const NO_SHOW_CONCERN_THRESHOLD = 8
const CANCELLATION_CONCERN_THRESHOLD = 15

export function BookingHealthCard({ health }: { health: BookingHealth }) {
  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Appointment health</CardTitle>
        <CardDescription>
          {formatNumber(health.scheduled)} appointment
          {health.scheduled === 1 ? '' : 's'} scheduled in this period
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-2xl font-semibold tabular-nums'>
              {formatNumber(health.completed)}
            </p>
            <p className='text-muted-foreground text-xs'>Completed</p>
          </div>
          <div>
            <p className='text-2xl font-semibold tabular-nums'>
              {formatNumber(health.confirmed)}
            </p>
            <p className='text-muted-foreground text-xs'>Still upcoming</p>
          </div>
        </div>

        <div className='space-y-4'>
          <RateBar
            label='No-shows'
            count={health.noShow}
            total={health.scheduled}
            rate={health.noShowRate}
            concerning={health.noShowRate > NO_SHOW_CONCERN_THRESHOLD}
          />
          <RateBar
            label='Cancellations'
            count={health.cancelled}
            total={health.scheduled}
            rate={health.cancellationRate}
            concerning={
              health.cancellationRate > CANCELLATION_CONCERN_THRESHOLD
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}

function RateBar({
  label,
  count,
  total,
  rate,
  concerning,
}: {
  label: string
  count: number
  total: number
  rate: number
  concerning: boolean
}) {
  return (
    <div className='space-y-1.5'>
      <div className='flex items-baseline justify-between'>
        <span className='text-sm font-medium'>{label}</span>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            concerning && 'text-amber-600 dark:text-amber-400',
          )}
        >
          {formatPercent(rate)}
        </span>
      </div>
      <div className='bg-muted h-2 overflow-hidden rounded-full'>
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            concerning ? 'bg-amber-500' : 'bg-primary',
          )}
          style={{ width: `${Math.min(100, rate)}%` }}
        />
      </div>
      <p className='text-muted-foreground text-xs'>
        {formatNumber(count)} of {formatNumber(total)} appointments
      </p>
    </div>
  )
}
