'use client'

import { IconCalendarEvent } from '@tabler/icons-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatTime } from '@/components/features/dashboard/utils/format'

type ScheduleEntry = {
  id: string
  bookingCode: string
  startTime: Date
  status: string
  customer: { name: string } | null
  service: { name: string } | null
  employee: { firstName: string; lastName: string } | null
  location: { name: string } | null
}

type TodaysScheduleCardProps = {
  schedule: ScheduleEntry[]
  remainingToday: number
  timezone: string
}

export function TodaysScheduleCard({
  schedule,
  remainingToday,
  timezone,
}: TodaysScheduleCardProps) {
  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Rest of today</CardTitle>
        <CardDescription>
          {remainingToday === 0
            ? 'Nothing further booked today'
            : `${remainingToday} appointment${remainingToday === 1 ? '' : 's'} still to come`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {schedule.length === 0 ? (
          <div className='text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 text-sm'>
            <IconCalendarEvent className='size-6 opacity-50' />
            The rest of the day is clear.
          </div>
        ) : (
          <div className='divide-border divide-y'>
            {schedule.map((entry) => (
              <Link
                key={entry.id}
                href='/bookings'
                className='hover:bg-muted/60 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors'
              >
                <span className='text-muted-foreground w-16 shrink-0 text-sm font-medium tabular-nums'>
                  {formatTime(entry.startTime, timezone)}
                </span>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {entry.service?.name ?? 'Service'}
                  </p>
                  <p className='text-muted-foreground truncate text-xs'>
                    {entry.customer?.name ?? 'Customer'}
                    {entry.employee
                      ? ` · ${entry.employee.firstName} ${entry.employee.lastName}`
                      : ''}
                  </p>
                </div>

                <Badge variant='secondary' className='shrink-0'>
                  {entry.status === 'COMPLETED' ? 'Done' : 'Confirmed'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
