'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'FULFILLED'
  | 'SHIPPED'
  | 'CANCELLED'
  | 'REFUNDED'

export type OrderListItem = {
  id: string
  orderCode: string
  status: OrderStatus
  totalCents: number
  currency: string
  createdAt: Date
  trackingNumber: string | null
  user: { id: string; name: string; email: string }
  items: Array<{
    id: string
    name: string
    quantity: number
    unitPriceCents: number
  }>
}

export function useOrders() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | undefined>()

  const query = useQuery(
    trpc.orders.list.queryOptions({
      page,
      limit: 20,
      search: search || undefined,
      status,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  )

  const data = query.data as
    | { items: OrderListItem[]; totalPages: number }
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
