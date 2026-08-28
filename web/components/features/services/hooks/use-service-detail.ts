"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useServiceDetail(slug: string) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.services.publicGetBySlug.queryOptions({ slug }),
    retry: false,
  });
}
