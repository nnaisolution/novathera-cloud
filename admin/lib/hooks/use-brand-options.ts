'use client'

import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

export type BrandOption = {
  id: string
  name: string
  isPlatform: boolean
  active: boolean
}

/**
 * Active brands for selector inputs. Shared by the products form and any other
 * feature that needs to attribute a record to a business.
 */
export function useBrandOptions() {
  const trpc = useTRPC()

  const { data, isLoading } = useQuery(
    trpc.brands.list.queryOptions({
      page: 1,
      limit: 50,
      active: true,
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }),
  )

  const list = data as { items: BrandOption[] } | undefined

  return { brands: list?.items ?? [], isLoading }
}
