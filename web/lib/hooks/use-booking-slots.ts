"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useBookingSlots(input: {
  locationId?: string | null;
  serviceId?: string | null;
  date?: string | null;
  employeeId?: string | null;
}) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.bookings.publicAvailableSlots.queryOptions({
      serviceId: input.serviceId!,
      locationId: input.locationId!,
      date: input.date ? new Date(`${input.date}T12:00:00`) : new Date(),
      employeeId: input.employeeId ?? undefined,
    }),
    enabled: Boolean(input.locationId && input.serviceId && input.date),
  });
}
