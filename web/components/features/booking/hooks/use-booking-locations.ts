"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useBookingCities() {
  const trpc = useNestTrpc();

  return useQuery(trpc.locations.publicCities.queryOptions());
}

export function useBookingLocations(input: {
  city?: string;
  search?: string;
}) {
  const trpc = useNestTrpc();

  return useQuery(
    trpc.locations.publicList.queryOptions({
      city: input.city,
      search: input.search || undefined,
    }),
  );
}
