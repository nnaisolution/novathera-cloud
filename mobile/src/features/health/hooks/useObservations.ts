import { skipToken, useQueries, useQuery } from "@tanstack/react-query";
import { OBSERVATION_TYPES, type ObservationType } from "../../../shared";

import { usePatientTrpc } from "../../../api/trpc";
import { toObservations, type Observation } from "../observations";

/**
 * `health.list` caps `limit` at 100 and offers no date-range filter, so this is
 * the hard ceiling on anything a screen can show. Every window on the trends
 * screen is carved out of these rows client-side.
 */
export const OBSERVATION_FETCH_LIMIT = 100;

/** Readings only change when the patient logs or syncs one. */
const OBSERVATION_STALE_TIME = 60_000;

export type LatestObservations = {
  /** Newest reading per type, newest first, for types that have any data. */
  entries: Observation[];
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  refetch: () => void;
};

/**
 * Newest reading for every observation type.
 *
 * One `health.list` call with no `type` would be simpler, but the 100-row cap
 * is shared across all types: a patient with 100 weight readings and one
 * glucose reading would look like they had never logged glucose. Asking for
 * `limit: 1` per type is exact instead, and `httpBatchLink` collapses the calls
 * into a single HTTP request.
 */
export function useLatestObservations(): LatestObservations {
  const trpc = usePatientTrpc();

  const results = useQueries({
    queries: OBSERVATION_TYPES.map((type) =>
      trpc.health.list.queryOptions({ type, limit: 1 }, { staleTime: OBSERVATION_STALE_TIME }),
    ),
  });

  const entries: Observation[] = [];
  for (const result of results) {
    if (!result.data) continue;
    const [observation] = toObservations(result.data);
    if (observation) entries.push(observation);
  }
  entries.sort((a, b) => b.effectiveAt.getTime() - a.effectiveAt.getTime());

  return {
    entries,
    isPending: results.some((result) => result.isPending),
    isFetching: results.some((result) => result.isFetching),
    isError: results.some((result) => result.isError),
    refetch: () => {
      for (const result of results) void result.refetch();
    },
  };
}

/**
 * Full available history for one type, newest first.
 *
 * Scoping the request to a single type spends the whole 100-row budget on the
 * metric being charted, which is the best this endpoint allows.
 */
export function useObservationSeries(type: ObservationType | null) {
  const trpc = usePatientTrpc();

  return useQuery(
    trpc.health.list.queryOptions(
      type === null ? skipToken : { type, limit: OBSERVATION_FETCH_LIMIT },
      { staleTime: OBSERVATION_STALE_TIME, select: toObservations },
    ),
  );
}
