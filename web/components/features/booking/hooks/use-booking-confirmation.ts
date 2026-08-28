"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useNestTrpc } from "@/lib/trpc/nest-client";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

export function useBookingConfirmation(
  bookingId: string | null,
  shouldPoll: boolean,
) {
  const trpc = useNestTrpc();
  const [deadline, setDeadline] = useState<number | null>(null);

  useEffect(() => {
    if (shouldPoll) {
      setDeadline(Date.now() + POLL_TIMEOUT_MS);
    }
  }, [shouldPoll]);

  return useQuery({
    ...trpc.bookings.myGetById.queryOptions({ id: bookingId ?? "" }),
    enabled: Boolean(bookingId),
    refetchInterval: (query) => {
      if (!shouldPoll || deadline === null) return false;
      if (query.state.data?.paymentStatus === "PAID") return false;
      if (Date.now() > deadline) return false;
      return POLL_INTERVAL_MS;
    },
  });
}
