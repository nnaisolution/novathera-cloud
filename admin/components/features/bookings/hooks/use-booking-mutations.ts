'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'

export function useBookingMutations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.bookings.list.queryKey() })

  const createMutation = useMutation(
    trpc.bookings.create.mutationOptions({
      onSuccess: () => {
        toast.success('Booking created')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const rescheduleMutation = useMutation(
    trpc.bookings.reschedule.mutationOptions({
      onSuccess: () => {
        toast.success('Booking rescheduled')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const cancelMutation = useMutation(
    trpc.bookings.cancel.mutationOptions({
      onSuccess: () => {
        toast.success('Booking cancelled')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const setStatusMutation = useMutation(
    trpc.bookings.setStatus.mutationOptions({
      onSuccess: () => {
        toast.success('Booking status updated')
        void invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) => mutation.mutateAsync(input) as Promise<unknown>

  return {
    createBooking: (input: {
      customerUserId: string
      serviceId: string
      employeeId: string
      locationId: string
      startTime: Date
      notes?: string
    }) => call(createMutation, input),
    rescheduleBooking: (input: {
      id: string
      startTime: Date
      employeeId?: string
    }) => call(rescheduleMutation, input),
    cancelBooking: (input: { id: string; reason?: string }) =>
      call(cancelMutation, input),
    markComplete: (id: string) =>
      call(setStatusMutation, { id, status: 'COMPLETED' as const }),
    markNoShow: (id: string) =>
      call(setStatusMutation, { id, status: 'NO_SHOW' as const }),
    isCreating: createMutation.isPending,
    isRescheduling: rescheduleMutation.isPending,
    isCancelling: cancelMutation.isPending,
  }
}
