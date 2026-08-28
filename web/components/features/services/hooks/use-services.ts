"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";
import type { ServiceActiveFilters } from "../types";

export function useServices(filters: ServiceActiveFilters) {
  const trpc = useNestTrpc();

  return useQuery(
    trpc.services.publicList.queryOptions({
      categoryId: filters.categoryId?.[0],
      tags: filters.tags?.length ? filters.tags : undefined,
    }),
  );
}

export function useServiceCategories() {
  const trpc = useNestTrpc();

  return useQuery(trpc.serviceCategories.publicList.queryOptions());
}

export function useServiceFacets() {
  const trpc = useNestTrpc();

  return useQuery(trpc.services.publicFacets.queryOptions());
}
