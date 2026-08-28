import { OBSERVATION_FETCH_LIMIT } from "./hooks/useObservations";
import type { Observation } from "./observations";

export const RANGE_OPTIONS = [7, 30, 90] as const;
export type RangeDays = (typeof RANGE_OPTIONS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

export type ObservationWindow = {
  /** Readings inside the window that carry a value, oldest first for charting. */
  observations: Observation[];
  start: Date;
  end: Date;
  /**
   * True when the request came back at the row cap and the oldest row we hold
   * is still newer than the start of the window. Older readings exist that the
   * endpoint never sent, so the window is a partial view and the UI has to say
   * so rather than presenting it as complete history.
   */
  mayBeIncomplete: boolean;
};

/**
 * `health.list` has no date-range filter, so a window is cut from the fixed
 * page of rows the endpoint returned.
 */
export function windowObservations(
  all: readonly Observation[],
  days: RangeDays,
  now: Date = new Date(),
): ObservationWindow {
  const end = now;
  const start = new Date(now.getTime() - days * DAY_MS);

  const observations = all
    .filter((observation) => observation.value !== null && observation.effectiveAt >= start)
    .sort((a, b) => a.effectiveAt.getTime() - b.effectiveAt.getTime());

  let oldestHeld: Date | null = null;
  for (const observation of all) {
    if (oldestHeld === null || observation.effectiveAt < oldestHeld) oldestHeld = observation.effectiveAt;
  }

  return {
    observations,
    start,
    end,
    mayBeIncomplete: all.length >= OBSERVATION_FETCH_LIMIT && oldestHeld !== null && oldestHeld > start,
  };
}
