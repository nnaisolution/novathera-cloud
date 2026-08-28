'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'

export function useSettings() {
  const trpc = useTRPC()
  const canRead = usePermission('setting', 'read')

  const query = useQuery({
    ...trpc.settings.get.queryOptions(),
    enabled: canRead,
  })

  return { ...query, canRead }
}

export function useUpdateSettings() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const canUpdate = usePermission('setting', 'update')

  const mutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: async (_data, variables) => {
        toast.success(`${variables.group} settings saved`)
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.settings.get.queryKey(),
          }),
          // Dashboard figures depend on timezone, currency and thresholds.
          queryClient.invalidateQueries({
            queryKey: trpc.analytics.overview.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.analytics.operations.queryKey(),
          }),
        ])
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }),
  )

  return { ...mutation, canUpdate }
}
