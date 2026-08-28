"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useNestTrpc } from "@/lib/trpc/nest-client";
import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";

export function useMyBookingActions() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.bookings.myList.queryKey() });

  const cancelMutation = useMutation(
    trpc.bookings.myCancel.mutationOptions({
      onSuccess: () => {
        toast.success("Booking cancelled");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const rescheduleMutation = useMutation(
    trpc.bookings.myReschedule.mutationOptions({
      onSuccess: () => {
        toast.success("Booking rescheduled");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  return {
    cancelBooking: (input: { id: string; reason?: string }) =>
      cancelMutation.mutateAsync(input),
    isCancelling: cancelMutation.isPending,
    rescheduleBooking: (input: { id: string; startTime: Date }) =>
      rescheduleMutation.mutateAsync(input),
    isRescheduling: rescheduleMutation.isPending,
  };
}
