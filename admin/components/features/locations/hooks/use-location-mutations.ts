'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { LocationFormValues } from '../schemas/location.schema'

function cleanPayload(values: LocationFormValues) {
  return {
    ...values,
    addressLine2: values.addressLine2 || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    googleMapsUrl: values.googleMapsUrl || undefined,
  }
}

export function useLocationMutations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.locations.list.queryKey() })

  const createMutation = useMutation(
    trpc.locations.create.mutationOptions({
      onSuccess: () => {
        toast.success('Location created')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const updateMutation = useMutation(
    trpc.locations.update.mutationOptions({
      onSuccess: () => {
        toast.success('Location updated')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deleteMutation = useMutation(
    trpc.locations.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Location deleted')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) => mutation.mutateAsync(input) as Promise<unknown>

  return {
    createLocation: (values: LocationFormValues) =>
      call(createMutation, cleanPayload(values)),
    updateLocation: (id: string, values: LocationFormValues) =>
      call(updateMutation, { id, ...cleanPayload(values) }),
    deleteLocation: (id: string) =>
      call(deleteMutation, { id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
