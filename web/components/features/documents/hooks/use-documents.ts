"use client";

import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useDocuments() {
  const trpc = useNestTrpc();
  return useQuery(trpc.documents.myList.queryOptions());
}
