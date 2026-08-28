'use client'

import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

export function useAvailableSlots(params: {
  serviceId?: string
  locationId?: string
  date?: Date
  employeeId?: string
}) {
  const trpc = useTRPC()
  const enabled = Boolean(params.serviceId && params.locationId && params.date)

  return useQuery({
    ...trpc.bookings.availableSlots.queryOptions({
      serviceId: params.serviceId!,
      locationId: params.locationId!,
      date: params.date!,
      employeeId: params.employeeId,
    }),
    enabled,
  })
}
