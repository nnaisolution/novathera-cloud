import { skipToken, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useNestTrpc } from "../../../api/trpc";
import { usePlatformSession } from "../../platform/hooks/usePlatformSession";

const CART_STALE_TIME = 15_000;

export function useCart() {
  const trpc = useNestTrpc();
  const platform = usePlatformSession();

  return useQuery(
    trpc.cart.get.queryOptions(platform === "ready" ? undefined : skipToken, {
      staleTime: CART_STALE_TIME,
    }),
  );
}

export function useCartActions() {
  const trpc = useNestTrpc();
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.cart.get.queryKey() });

  const addItem = useMutation(
    trpc.cart.addItem.mutationOptions({
      onSuccess: () => void invalidate(),
    }),
  );

  const updateQuantity = useMutation(
    trpc.cart.updateQuantity.mutationOptions({
      onSuccess: () => void invalidate(),
    }),
  );

  const removeItem = useMutation(
    trpc.cart.removeItem.mutationOptions({
      onSuccess: () => void invalidate(),
    }),
  );

  const checkout = useMutation(trpc.checkout.createSession.mutationOptions());

  return { addItem, updateQuantity, removeItem, checkout };
}
