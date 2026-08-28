'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED'

export type ProductListItem = {
  id: string
  name: string
  slug: string
  status: ProductStatus
  priceCents: number
  currency: string
  category: { name: string } | null
  images: Array<{ url: string; alt?: string | null }>
  inventory: {
    quantity: number
    lowStockThreshold: number
  } | null
}

export function useProducts() {
  const trpc = useTRPC()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatus | undefined>()
  const [categoryId, setCategoryId] = useState<string | undefined>()

  const query = useQuery(
    trpc.products.list.queryOptions({
      page,
      limit: 20,
      search: search || undefined,
      status,
      categoryId,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  )

  const data = query.data as
    | { items: ProductListItem[]; totalPages: number }
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
    categoryId,
    setCategoryId,
  }
}
