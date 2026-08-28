'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { DiscountFormValues } from '../schemas/discount.schema'

export function useDiscountMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: trpc.discounts.list.queryKey() })
  }

  const createMutation = useMutation(
    trpc.discounts.create.mutationOptions({
      onSuccess: () => {
        toast.success('Discount created')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deactivateMutation = useMutation(
    trpc.discounts.deactivate.mutationOptions({
      onSuccess: () => {
        toast.success('Discount deactivated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    createDiscount: (values: DiscountFormValues) =>
      call(createMutation, {
        code: values.code,
        type: values.type,
        percentOff:
          values.type === 'PERCENT' ? values.percentOff : undefined,
        amountOffCents:
          values.type === 'FIXED' && values.amountOff != null
            ? Math.round(values.amountOff * 100)
            : undefined,
        expiresAt: values.expiresAt
          ? new Date(`${values.expiresAt}T23:59:59`)
          : undefined,
      }),
    deactivateDiscount: (id: string) => call(deactivateMutation, { id }),
    isCreating: createMutation.isPending,
  }
}
