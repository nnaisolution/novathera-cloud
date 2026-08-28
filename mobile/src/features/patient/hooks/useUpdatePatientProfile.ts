import { useMutation, useQueryClient } from "@tanstack/react-query";

import { usePatientTrpc } from "../../../api/trpc";

/**
 * `patient.updateProfile` accepts only `displayName`, `locale`, and `timezone`,
 * all optional, and returns the updated row. Everything else on the Patient
 * model is either unselected by the router or, in the case of the phone number,
 * encrypted at rest and never returned.
 */
export function useUpdatePatientProfile() {
  const trpc = usePatientTrpc();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.patient.updateProfile.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: trpc.patient.me.queryKey() }),
    }),
  );
}
