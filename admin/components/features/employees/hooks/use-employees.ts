'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTRPC } from '@/lib/trpc/client'

export function useEmployees() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const query = useQuery(
    trpc.employees.list.queryOptions({
      page,
      limit: 10,
      search: search || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  )

  const data = query.data as
    | {
        items: Array<Record<string, unknown> & {
          id: string
          firstName: string
          lastName: string
          employeeCode: string
          jobTitle: string
          department: string
          status: 'ACTIVE' | 'INACTIVE'
          photoUrl: string | null
          role?: string | null
        }>
        totalPages: number
      }
    | undefined

  return { ...query, data, page, setPage, search, setSearch }
}
