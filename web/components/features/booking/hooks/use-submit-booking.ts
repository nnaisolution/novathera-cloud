"use client";

import { useMutation } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useSubmitBooking() {
  const trpc = useNestTrpc();

  return useMutation(trpc.bookings.myCreate.mutationOptions());
}
