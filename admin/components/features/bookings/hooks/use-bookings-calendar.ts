'use client'

import { useQuery } from '@tanstack/react-query'
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns'
import { useState } from 'react'
import type { View } from 'react-big-calendar'
import { useTRPC } from '@/lib/trpc/client'
import type { BookingListItem } from '../types'

type Filters = {
  search?: string
  status?: BookingListItem['status']
  employeeId?: string
  locationId?: string
}

function defaultRange() {
  const anchor = new Date()
  return {
    from: startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 }),
    to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 }),
  }
}

export function useBookingsCalendar(filters: Filters) {
  const trpc = useTRPC()
  const [range, setRange] = useState(defaultRange)
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  const query = useQuery(
    trpc.bookings.list.queryOptions({
      page: 1,
      limit: 100,
      search: filters.search || undefined,
      status: filters.status,
      employeeId: filters.employeeId,
      locationId: filters.locationId,
      from: range.from,
      to: range.to,
      sortBy: 'startTime',
      sortOrder: 'asc',
    }),
  )

  const data = query.data as
    | { items: BookingListItem[]; total: number }
    | undefined

  return {
    ...query,
    bookings: data?.items ?? [],
    total: data?.total ?? 0,
    range,
    setRange,
    view,
    setView,
    date,
    setDate,
  }
}
