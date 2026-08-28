'use client'

import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'

export type ProductCategoryOption = {
  id: string
  name: string
  slug: string
}

export function useProductCategories() {
  const trpc = useTRPC()
  const { data, isLoading } = useQuery(trpc.products.publicFacets.queryOptions())
  const facets = data as { categories?: ProductCategoryOption[] } | undefined
  return { categories: facets?.categories ?? [], isLoading }
}
