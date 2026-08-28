import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNestTrpc } from "../../../api/trpc";
import { usePlatformSession } from "../../platform/hooks/usePlatformSession";

export type BookingScope = "upcoming" | "past";

/**
 * `bookings.myList` is page-based, not cursor-based, so there is no infinite
 * query to build on. A modest page keeps the request small and the Previous /
 * Next controls honest about where the patient is in their history.
 */
export const BOOKINGS_PAGE_SIZE = 10;

const BOOKINGS_STALE_TIME = 30_000;

export function useMyBookings(scope: BookingScope, page: number) {
  const trpc = useNestTrpc();
  const platform = usePlatformSession();

  return useQuery(
    trpc.bookings.myList.queryOptions(
      // Without a platform session this request can only 401, which would
      // re-trip the invalidation path for nothing.
      platform === "ready"
        ? {
            page,
            limit: BOOKINGS_PAGE_SIZE,
            scope,
            // Soonest first when looking forward, most recent first when looking back.
            sortOrder: scope === "upcoming" ? "asc" : "desc",
          }
        : skipToken,
      // Deliberately no `keepPreviousData`: the scope is part of the query key,
      // so holding the last page would render upcoming visits under the "Past"
      // tab for a frame. A brief loading state is better than a wrong label.
      { staleTime: BOOKINGS_STALE_TIME },
    ),
  );
}

export function useCancelBooking() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.bookings.myCancel.mutationOptions({
      onSuccess: () =>
        // Every scope and page is affected: the visit leaves "upcoming" and
        // reappears under "past".
        queryClient.invalidateQueries({ queryKey: trpc.bookings.myList.queryKey() }),
    }),
  );
}

/** Mints a Stripe Checkout URL for a booking still marked `PENDING`. */
export function useBookingCheckout() {
  const trpc = useNestTrpc();
  return useMutation(trpc.bookings.createCheckoutSession.mutationOptions());
}

export function useRefreshBookings() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: trpc.bookings.myList.queryKey() });
  };
}
