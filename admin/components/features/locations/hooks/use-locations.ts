'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTRPC } from '@/lib/trpc/client'

export function useLocations() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'OPEN' | 'COMING_SOON' | 'CLOSED' | undefined>()

  const query = useQuery(
    trpc.locations.list.queryOptions({
      page,
      limit: 10,
      search: search || undefined,
      status,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  )

  const data = query.data as
    | {
        items: Array<Record<string, unknown> & { id: string; name: string; city: string; status: 'OPEN' | 'COMING_SOON' | 'CLOSED'; operatingHours: unknown }>
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
  }
}
