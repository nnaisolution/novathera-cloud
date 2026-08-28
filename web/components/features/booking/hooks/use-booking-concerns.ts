"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useBookingConcernCategories() {
  const trpc = useNestTrpc();

  return useQuery(trpc.serviceCategories.publicList.queryOptions());
}

export function useBookingServices(input: {
  categoryId?: string;
  locationId?: string;
  search?: string;
}) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.services.publicList.queryOptions({
      categoryId: input.categoryId,
      locationId: input.locationId,
    }),
    select: (services) => {
      if (!input.search?.trim()) return services;
      const q = input.search.trim().toLowerCase();
      return services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.shortDescription?.toLowerCase().includes(q) ?? false),
      );
    },
  });
}
