import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNestTrpc } from "../../../api/trpc";
import { usePlatformSession } from "../../platform/hooks/usePlatformSession";

/** Plan and renewal state only move on a Stripe webhook, not on navigation. */
const MEMBERSHIP_STALE_TIME = 60_000;

export function useMembership() {
  const trpc = useNestTrpc();
  const platform = usePlatformSession();

  return useQuery(
    trpc.membership.myGetCurrent.queryOptions(platform === "ready" ? undefined : skipToken, {
      staleTime: MEMBERSHIP_STALE_TIME,
    }),
  );
}

/** Returns a Stripe Checkout URL for a new or upgraded subscription. */
export function useUpgradeMembership() {
  const trpc = useNestTrpc();
  return useMutation(trpc.membership.myUpgradePlan.mutationOptions());
}

/** Returns a Stripe Billing Portal URL for an existing subscription. */
export function useManageMembership() {
  const trpc = useNestTrpc();
  return useMutation(trpc.membership.myManagePlan.mutationOptions());
}

export function useRefreshMembership() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: trpc.membership.myGetCurrent.queryKey() });
  };
}
