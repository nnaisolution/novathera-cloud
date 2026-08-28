"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useMembership() {
  const trpc = useNestTrpc();
  return useQuery(trpc.membership.myGetCurrent.queryOptions());
}

export function useMembershipActions() {
  const trpc = useNestTrpc();

  const upgradeMutation = useMutation(
    trpc.membership.myUpgradePlan.mutationOptions({
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const manageMutation = useMutation(
    trpc.membership.myManagePlan.mutationOptions({
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  return {
    upgradePlan: (planId: "essential" | "enhanced" | "elite") =>
      upgradeMutation.mutateAsync({ planId }),
    isUpgrading: upgradeMutation.isPending,
    managePlan: () => manageMutation.mutateAsync(undefined),
    isManaging: manageMutation.isPending,
  };
}
