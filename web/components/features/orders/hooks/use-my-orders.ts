"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useMyOrders() {
  const trpc = useNestTrpc();
  const [page, setPage] = useState(1);

  const query = useQuery(
    trpc.orders.myList.queryOptions({
      page,
      limit: 10,
      sortBy: "createdAt",
    }),
  );

  return { ...query, page, setPage };
}

export function useMyOrder(id: string) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.orders.myGetById.queryOptions({ id }),
    enabled: Boolean(id),
  });
}

export function useOrderBySessionId(sessionId: string | null) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.orders.myGetBySessionId.queryOptions({
      sessionId: sessionId ?? "",
    }),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order) return 2000;
      if (order.status === "PENDING") return 2000;
      return false;
    },
  });
}
