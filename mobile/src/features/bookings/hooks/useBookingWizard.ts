import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNestTrpc } from "../../../api/trpc";
import { calendarDateFromKey } from "../bookings";

const CATALOG_STALE_TIME = 30_000;

function trpcErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const data = "data" in error ? error.data : undefined;
  if (typeof data !== "object" || data === null) return undefined;
  const code = "code" in data ? data.code : undefined;
  return typeof code === "string" ? code : undefined;
}

export function isUnauthorizedError(error: unknown): boolean {
  return trpcErrorCode(error) === "UNAUTHORIZED";
}

/** Locations are a public Nest procedure — no platform session required. */
export function usePublicLocations() {
  const trpc = useNestTrpc();
  return useQuery(trpc.locations.publicList.queryOptions({}, { staleTime: CATALOG_STALE_TIME }));
}

export function usePublicServiceCategories() {
  const trpc = useNestTrpc();
  return useQuery(trpc.serviceCategories.publicList.queryOptions(undefined, { staleTime: CATALOG_STALE_TIME }));
}

export function usePublicServices(locationId: string | null, categoryId: string | null) {
  const trpc = useNestTrpc();
  return useQuery(
    trpc.services.publicList.queryOptions(
      locationId && categoryId ? { locationId, categoryId } : skipToken,
      { staleTime: CATALOG_STALE_TIME },
    ),
  );
}

export function usePublicStaff(serviceId: string | null, locationId: string | null, enabled: boolean) {
  const trpc = useNestTrpc();
  return useQuery(
    trpc.bookings.publicStaff.queryOptions(
      enabled && serviceId && locationId ? { serviceId, locationId } : skipToken,
      { staleTime: CATALOG_STALE_TIME },
    ),
  );
}

export function usePublicAvailableSlots(input: {
  locationId: string | null;
  serviceId: string | null;
  dateKey: string | null;
  employeeId: string | null;
}) {
  const trpc = useNestTrpc();
  const ready = Boolean(input.locationId && input.serviceId && input.dateKey);

  return useQuery(
    trpc.bookings.publicAvailableSlots.queryOptions(
      ready && input.locationId && input.serviceId && input.dateKey
        ? {
            locationId: input.locationId,
            serviceId: input.serviceId,
            date: calendarDateFromKey(input.dateKey),
            employeeId: input.employeeId ?? undefined,
          }
        : skipToken,
      { staleTime: 15_000 },
    ),
  );
}

export function useCreateMyBooking() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.bookings.myCreate.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: trpc.bookings.myList.queryKey() });
      },
    }),
  );
}
