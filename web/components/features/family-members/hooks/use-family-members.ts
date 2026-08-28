"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useFamilyMembers(enabled = true) {
  const trpc = useNestTrpc();
  return useQuery({
    ...trpc.familyMembers.myList.queryOptions(),
    enabled,
  });
}

export function useFamilyMemberActions() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.familyMembers.myList.queryKey(),
    });

  const createMutation = useMutation(
    trpc.familyMembers.myCreate.mutationOptions({
      onSuccess: () => {
        toast.success("Family member added");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const updateMutation = useMutation(
    trpc.familyMembers.myUpdate.mutationOptions({
      onSuccess: () => {
        toast.success("Family member updated");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const deleteMutation = useMutation(
    trpc.familyMembers.myDelete.mutationOptions({
      onSuccess: () => {
        toast.success("Family member removed");
        void invalidate();
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  return {
    createMember: (input: { name: string; relationship: string }) =>
      createMutation.mutateAsync(input),
    isCreating: createMutation.isPending,
    updateMember: (input: { id: string; name: string; relationship: string }) =>
      updateMutation.mutateAsync(input),
    isUpdating: updateMutation.isPending,
    deleteMember: (id: string) => deleteMutation.mutateAsync({ id }),
    isDeleting: deleteMutation.isPending,
  };
}
