'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { ShippingTierFormValues } from '../schemas/shipping-tier.schema'

function toPayload(values: ShippingTierFormValues) {
  const freeOver =
    values.freeOver === '' || values.freeOver == null
      ? null
      : Math.round(Number(values.freeOver) * 100)
  const minDeliveryDays =
    values.minDeliveryDays === '' || values.minDeliveryDays == null
      ? null
      : Number(values.minDeliveryDays)
  const maxDeliveryDays =
    values.maxDeliveryDays === '' || values.maxDeliveryDays == null
      ? null
      : Number(values.maxDeliveryDays)

  return {
    name: values.name,
    rateCents: Math.round(values.rate * 100),
    freeOverCents: freeOver,
    minDeliveryDays,
    maxDeliveryDays,
    active: values.active,
  }
}

export function useShippingMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: trpc.shippingTiers.list.queryKey() })
  }

  const createMutation = useMutation(
    trpc.shippingTiers.create.mutationOptions({
      onSuccess: () => {
        toast.success('Shipping tier created')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const updateMutation = useMutation(
    trpc.shippingTiers.update.mutationOptions({
      onSuccess: () => {
        toast.success('Shipping tier updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deleteMutation = useMutation(
    trpc.shippingTiers.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Shipping tier deleted')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    createTier: (values: ShippingTierFormValues) =>
      call(createMutation, toPayload(values)),
    updateTier: (id: string, values: ShippingTierFormValues) =>
      call(updateMutation, { id, ...toPayload(values) }),
    deleteTier: (id: string) => call(deleteMutation, { id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
