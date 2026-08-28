"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useCart(enabled = true) {
  const trpc = useNestTrpc();
  const { data: session } = authClient.useSession();
  const isAuthed = Boolean(session?.user);

  return useQuery({
    ...trpc.cart.get.queryOptions(),
    enabled: enabled && isAuthed,
  });
}

export function useCartActions() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.cart.get.queryKey() });

  const addItem = useMutation(
    trpc.cart.addItem.mutationOptions({
      onSuccess: () => {
        void invalidate();
        toast.success("Added to cart");
      },
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const updateQuantity = useMutation(
    trpc.cart.updateQuantity.mutationOptions({
      onSuccess: () => void invalidate(),
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const removeItem = useMutation(
    trpc.cart.removeItem.mutationOptions({
      onSuccess: () => void invalidate(),
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const clear = useMutation(
    trpc.cart.clear.mutationOptions({
      onSuccess: () => void invalidate(),
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  const checkout = useMutation(
    trpc.checkout.createSession.mutationOptions({
      onError: (error: unknown) =>
        toast.error(getNestTrpcErrorMessage(error)),
    }),
  );

  return {
    addItem,
    updateQuantity,
    removeItem,
    clear,
    checkout,
  };
}
