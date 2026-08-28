'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTRPC } from '@/lib/trpc/client'
import type { BookingListItem } from '../types'

export function useBookings() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BookingListItem['status'] | undefined>()
  const [employeeId, setEmployeeId] = useState<string | undefined>()
  const [locationId, setLocationId] = useState<string | undefined>()

  const query = useQuery(
    trpc.bookings.list.queryOptions({
      page,
      limit: 10,
      search: search || undefined,
      status,
      employeeId,
      locationId,
      sortBy: 'startTime',
      sortOrder: 'desc',
    }),
  )

  const data = query.data as
    | {
        items: BookingListItem[]
        totalPages: number
      }
    | undefined

  return {
    ...query,
    data,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    employeeId,
    setEmployeeId,
    locationId,
    setLocationId,
  }
}
