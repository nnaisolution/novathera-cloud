import { useQuery } from "@tanstack/react-query";

import { usePatientTrpc } from "../../../api/trpc";

/**
 * There is no `firstName` on the patient record. `patient.me` returns
 * `displayName` and it is nullable, so a first name has to be derived and the
 * UI has to read well when there is nothing to derive from.
 */
export function deriveFirstName(displayName: string | null | undefined): string | null {
  if (!displayName) return null;
  const [first] = displayName.trim().split(/\s+/);
  return first && first.length > 0 ? first : null;
}

export function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function buildGreeting(displayName: string | null | undefined, now: Date = new Date()): string {
  const greeting = greetingForHour(now.getHours());
  const firstName = deriveFirstName(displayName);
  return firstName ? `${greeting}, ${firstName}` : greeting;
}

/** Profile rarely changes within a session. */
const PROFILE_STALE_TIME = 5 * 60_000;

export function usePatientProfile() {
  const trpc = usePatientTrpc();
  return useQuery(trpc.patient.me.queryOptions(undefined, { staleTime: PROFILE_STALE_TIME }));
}
