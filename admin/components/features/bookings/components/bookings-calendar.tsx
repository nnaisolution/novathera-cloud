'use client'

import { format, getDay, parse, startOfWeek } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { useEffect, useMemo, useState } from 'react'
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type View,
} from 'react-big-calendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { usePermission } from '@/lib/auth/use-permission'
import { useBookingsCalendar } from '../hooks/use-bookings-calendar'
import { useBookingMutations } from '../hooks/use-booking-mutations'
import type { BookingListItem } from '../types'
import '../bookings-calendar.css'

const locales = { 'en-US': enUS }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 0 }),
  getDay,
  locales,
})

type CalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  resource: BookingListItem
}

const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
} as const

const STATUS_COLORS: Record<BookingListItem['status'], string> = {
  CONFIRMED: 'hsl(221 83% 53%)',
  COMPLETED: 'hsl(142 71% 45%)',
  CANCELLED: 'hsl(0 0% 55%)',
  NO_SHOW: 'hsl(25 95% 53%)',
}

function BookingEvent({ event }: EventProps<CalendarEvent>) {
  const booking = event.resource
  return (
    <div className='overflow-hidden px-1.5 py-1 text-[11px] leading-tight text-white'>
      <div className='truncate font-semibold'>{booking.customer.name}</div>
      <div className='truncate opacity-90'>{booking.service.name}</div>
    </div>
  )
}

type BookingsCalendarProps = {
  search?: string
  status?: BookingListItem['status']
  employeeId?: string
  locationId?: string
}

export function BookingsCalendar({
  search,
  status,
  employeeId,
  locationId,
}: BookingsCalendarProps) {
  const [mounted, setMounted] = useState(false)
  const [selected, setSelected] = useState<BookingListItem | null>(null)
  const canCancel = usePermission('booking', 'cancel')
  const canSetStatus = usePermission('booking', 'setStatus')
  const { cancelBooking, markComplete, markNoShow, isCancelling } =
    useBookingMutations()

  const {
    bookings,
    total,
    isLoading,
    setRange,
    view,
    setView,
    date,
    setDate,
  } = useBookingsCalendar({ search, status, employeeId, locationId })

  useEffect(() => {
    setMounted(true)
  }, [])

  const events = useMemo<CalendarEvent[]>(
    () =>
      bookings.map((booking) => ({
        id: booking.id,
        title: `${booking.customer.name} — ${booking.service.name}`,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resource: booking,
      })),
    [bookings],
  )

  if (!mounted) {
    return <Skeleton className='h-[640px] w-full rounded-xl' />
  }

  return (
    <div className='bookings-calendar space-y-3'>
      {total > 100 && (
        <p className='text-muted-foreground text-sm'>
          Showing first 100 of {total} bookings in this range. Narrow filters or
          switch to week/day view.
        </p>
      )}

      <Calendar
        localizer={localizer}
        events={events}
        view={view}
        date={date}
        onView={(nextView: View) => setView(nextView)}
        onNavigate={(nextDate) => setDate(nextDate)}
        onRangeChange={(nextRange) => {
          if (Array.isArray(nextRange) && nextRange.length >= 2) {
            setRange({ from: nextRange[0]!, to: nextRange[nextRange.length - 1]! })
          } else if (nextRange && 'start' in nextRange && 'end' in nextRange) {
            setRange({ from: nextRange.start, to: nextRange.end })
          }
        }}
        onSelectEvent={(event) => setSelected(event.resource)}
        components={{ event: BookingEvent }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: STATUS_COLORS[event.resource.status],
          },
        })}
        popup
        showMultiDayTimes
        style={{ height: 640 }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView='month'
      />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className='sm:max-w-md'>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.service.name}</DialogTitle>
                <DialogDescription>
                  {selected.bookingCode} ·{' '}
                  {format(new Date(selected.startTime), 'EEEE, MMM d · h:mm a')}
                  {' – '}
                  {format(new Date(selected.endTime), 'h:mm a')}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-3 text-sm'>
                <div>
                  <p className='text-muted-foreground text-xs uppercase tracking-wide'>
                    Customer
                  </p>
                  <p className='font-medium'>{selected.customer.name}</p>
                  <p className='text-muted-foreground'>{selected.customer.email}</p>
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <p className='text-muted-foreground text-xs uppercase tracking-wide'>
                      Employee
                    </p>
                    <p>
                      {selected.employee.firstName} {selected.employee.lastName}
                    </p>
                  </div>
                  <div>
                    <p className='text-muted-foreground text-xs uppercase tracking-wide'>
                      Location
                    </p>
                    <p>{selected.location.name}</p>
                  </div>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>
                    {STATUS_LABELS[selected.status]}
                  </Badge>
                  <Badge variant='outline'>{selected.paymentStatus}</Badge>
                </div>
              </div>

              <DialogFooter className='gap-2 sm:justify-start'>
                {canSetStatus && selected.status === 'CONFIRMED' && (
                  <>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={async () => {
                        await markComplete(selected.id)
                        setSelected(null)
                      }}
                    >
                      Mark complete
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={async () => {
                        await markNoShow(selected.id)
                        setSelected(null)
                      }}
                    >
                      No show
                    </Button>
                  </>
                )}
                {canCancel && selected.status === 'CONFIRMED' && (
                  <Button
                    size='sm'
                    variant='destructive'
                    disabled={isCancelling}
                    onClick={async () => {
                      await cancelBooking({ id: selected.id })
                      setSelected(null)
                    }}
                  >
                    Cancel booking
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && (
        <p className='text-muted-foreground text-center text-xs'>
          Refreshing bookings…
        </p>
      )}
    </div>
  )
}
