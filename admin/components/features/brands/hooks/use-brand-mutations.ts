'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { BrandFormValues } from '../schemas/brand.schema'

function toPayload(values: BrandFormValues) {
  return {
    name: values.name,
    tagline: values.tagline ? values.tagline : null,
    logoUrl: values.logoUrl ? values.logoUrl : null,
    displayOrder: Number(values.displayOrder) || 0,
    active: values.active,
  }
}

export function useBrandMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: trpc.brands.list.queryKey() })
  }

  const createMutation = useMutation(
    trpc.brands.create.mutationOptions({
      onSuccess: () => {
        toast.success('Brand created')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const updateMutation = useMutation(
    trpc.brands.update.mutationOptions({
      onSuccess: () => {
        toast.success('Brand updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deleteMutation = useMutation(
    trpc.brands.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Brand deleted')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const setPlatformMutation = useMutation(
    trpc.brands.setPlatform.mutationOptions({
      onSuccess: () => {
        toast.success('Platform brand updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const onboardMutation = useMutation(
    trpc.brands.startConnectOnboarding.mutationOptions({
      onSuccess: (result: unknown) => {
        const url = (result as { url?: string })?.url
        if (url) {
          // Stripe-hosted onboarding. New tab keeps the admin session intact.
          window.open(url, '_blank', 'noopener,noreferrer')
        }
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const refreshStatusMutation = useMutation(
    trpc.brands.refreshConnectStatus.mutationOptions({
      onSuccess: () => {
        toast.success('Stripe status refreshed')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    createBrand: (values: BrandFormValues) =>
      call(createMutation, toPayload(values)),
    updateBrand: (id: string, values: BrandFormValues) =>
      call(updateMutation, { id, ...toPayload(values) }),
    deleteBrand: (id: string) => call(deleteMutation, { id }),
    setPlatform: (id: string) => call(setPlatformMutation, { id }),
    startOnboarding: (id: string) => call(onboardMutation, { id }),
    refreshStatus: (id: string) => call(refreshStatusMutation, { id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isOnboarding: onboardMutation.isPending,
    isRefreshing: refreshStatusMutation.isPending,
  }
}
