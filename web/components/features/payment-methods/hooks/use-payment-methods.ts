"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

export function usePaymentMethods() {
  const trpc = useNestTrpc();
  return useQuery(trpc.paymentMethods.myList.queryOptions());
}

export function usePaymentMethodActions() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.paymentMethods.myList.queryKey(),
    });

  const createSetupIntentMutation = useMutation(
    trpc.paymentMethods.myCreateSetupIntent.mutationOptions({
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const detachMutation = useMutation(
    trpc.paymentMethods.myDetach.mutationOptions({
      onSuccess: () => {
        toast.success("Card removed");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const setDefaultMutation = useMutation(
    trpc.paymentMethods.mySetDefault.mutationOptions({
      onSuccess: () => {
        toast.success("Default card updated");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const { mutateAsync: createSetupIntentAsync } = createSetupIntentMutation;
  const { mutateAsync: detachAsync } = detachMutation;
  const { mutateAsync: setDefaultAsync } = setDefaultMutation;

  const createSetupIntent = useCallback(
    () => createSetupIntentAsync(),
    [createSetupIntentAsync],
  );
  const detachCard = useCallback(
    (paymentMethodId: string) => detachAsync({ paymentMethodId }),
    [detachAsync],
  );
  const setDefaultCard = useCallback(
    (paymentMethodId: string) => setDefaultAsync({ paymentMethodId }),
    [setDefaultAsync],
  );

  return {
    createSetupIntent,
    isCreatingSetupIntent: createSetupIntentMutation.isPending,
    detachCard,
    isDetaching: detachMutation.isPending,
    setDefaultCard,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
