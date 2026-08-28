"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useBookingStaff(input: {
  serviceId?: string | null;
  locationId?: string | null;
}) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.bookings.publicStaff.queryOptions({
      serviceId: input.serviceId!,
      locationId: input.locationId!,
    }),
    enabled: Boolean(input.serviceId && input.locationId),
  });
}
