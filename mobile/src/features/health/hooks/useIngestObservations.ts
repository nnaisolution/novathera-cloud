import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { HealthObservationInput } from "../../../shared";

import { usePatientTrpc } from "../../../api/trpc";

export function useIngestObservations() {
  const trpc = usePatientTrpc();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.health.ingest.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.health.list.queryKey() }),
    }),
  );
}

export type IngestObservationInput = HealthObservationInput;
