'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'

export function useOrderMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = (id?: string) => {
    void qc.invalidateQueries({ queryKey: trpc.orders.list.queryKey() })
    if (id) {
      void qc.invalidateQueries({
        queryKey: trpc.orders.getById.queryKey({ id }),
      })
    }
  }

  const setFulfillment = useMutation(
    trpc.orders.setFulfillmentStatus.mutationOptions({
      onSuccess: () => {
        toast.success('Order fulfillment updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const retryTransfers = useMutation(
    trpc.orders.retryBrandTransfers.mutationOptions({
      onSuccess: () => toast.success('Brand payout re-attempted'),
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    markFulfilled: async (id: string) => {
      await call(setFulfillment, { id, status: 'FULFILLED' })
      invalidate(id)
    },
    markShipped: async (id: string, trackingNumber: string) => {
      await call(setFulfillment, {
        id,
        status: 'SHIPPED',
        trackingNumber,
      })
      invalidate(id)
    },
    retryBrandTransfers: async (id: string) => {
      await call(retryTransfers, { id })
      invalidate(id)
    },
    isUpdating: setFulfillment.isPending,
    isRetryingTransfers: retryTransfers.isPending,
  }
}
