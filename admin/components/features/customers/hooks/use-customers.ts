'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

const PAGE_SIZE = 10

export function useCustomers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'listUsers', 'customers', page, search],
    queryFn: async () => {
      const res = await authClient.admin.listUsers({
        query: {
          filterField: 'role',
          filterValue: 'customer',
          filterOperator: 'eq',
          limit: PAGE_SIZE,
          offset: (page - 1) * PAGE_SIZE,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          ...(search
            ? {
                searchField: 'email' as const,
                searchOperator: 'contains' as const,
                searchValue: search,
              }
            : {}),
        },
      })

      if (res.error) {
        throw new Error(
          res.error.status === 403
            ? "You don't have permission to view customers."
            : 'Something went wrong. Please try again.',
        )
      }

      return res.data
    },
  })

  const total = query.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    ...query,
    users: query.data?.users ?? [],
    total,
    totalPages,
    page,
    setPage,
    search,
    setSearch,
  }
}
