"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

export type MyBookingsScope = "upcoming" | "past";

export function useMyBookings(scope: MyBookingsScope) {
  const trpc = useNestTrpc();
  const [page, setPage] = useState(1);

  const query = useQuery(
    trpc.bookings.myList.queryOptions({
      page,
      limit: 10,
      scope,
    }),
  );

  return { ...query, page, setPage };
}
