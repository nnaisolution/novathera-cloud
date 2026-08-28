'use client'

import { useState } from 'react'
import { useTRPC } from '@/lib/trpc/client'
import { useQuery } from '@tanstack/react-query'
import type { PaymentListItem } from '../types'

type PaymentStatusFilter = 'PENDING' | 'PAID' | 'REFUNDED'

export function usePayments() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<
    PaymentStatusFilter | undefined
  >()
  const [from, setFrom] = useState<Date | undefined>()
  const [to, setTo] = useState<Date | undefined>()

  const query = useQuery(
    trpc.bookings.listPayments.queryOptions({
      page,
      limit: 10,
      search: search || undefined,
      paymentStatus,
      from,
      to,
    }),
  )

  const data = query.data as
    | { items: PaymentListItem[]; totalPages: number }
    | undefined

  return {
    ...query,
    data,
    page,
    setPage,
    search,
    setSearch,
    paymentStatus,
    setPaymentStatus,
    from,
    setFrom,
    to,
    setTo,
  }
}
