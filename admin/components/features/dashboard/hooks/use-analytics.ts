'use client'

import { useQuery } from '@tanstack/react-query'

import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'
import type { DateRange } from '@/components/features/dashboard/types'

/**
 * Revenue and growth. Only admins and managers hold `analytics:read`, so the
 * query is disabled entirely for everyone else rather than firing a request
 * that is guaranteed to come back FORBIDDEN.
 */
export function useAnalyticsOverview(range: DateRange) {
  const trpc = useTRPC()
  const canRead = usePermission('analytics', 'read')

  const isCustomAndIncomplete =
    range.preset === 'custom' && (!range.from || !range.to)

  const query = useQuery({
    ...trpc.analytics.overview.queryOptions({
      preset: range.preset,
      ...(range.preset === 'custom' ? { from: range.from, to: range.to } : {}),
    }),
    enabled: canRead && !isCustomAndIncomplete,
  })

  return { ...query, canRead }
}

/** Run-the-clinic panel. Available to anyone with `booking:read`. */
export function useAnalyticsOperations() {
  const trpc = useTRPC()
  const canRead = usePermission('booking', 'read')

  const query = useQuery({
    ...trpc.analytics.operations.queryOptions(),
    enabled: canRead,
    // Operational counts go stale fast; refresh while the tab is open.
    refetchInterval: 60_000,
  })

  return { ...query, canRead }
}
