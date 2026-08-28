import { useMutation } from "@tanstack/react-query";

import { useNestTrpc, usePatientTrpc } from "../../../api/trpc";
import { usePlatformSession } from "../../platform/hooks/usePlatformSession";
import { registerForPush, type PushRegisterResult } from "../../../notifications/push";

/**
 * Hashes the Expo push token for the patient API. When a platform session
 * exists, Nest also receives the live Expo token so booking push can send.
 */
export function useRegisterPushDevice() {
  const patient = usePatientTrpc();
  const nest = useNestTrpc();
  const platform = usePlatformSession();

  const registerPatient = useMutation(patient.notifications.registerDevice.mutationOptions());
  const registerNest = useMutation(nest.notifications.myRegisterDevice.mutationOptions());

  return useMutation({
    mutationFn: async (): Promise<PushRegisterResult> => {
      const result = await registerForPush();
      if (result.status !== "registered") return result;

      await registerPatient.mutateAsync({
        platform: result.registration.platform,
        tokenHash: result.registration.tokenHash,
      });

      if (platform === "ready") {
        try {
          await registerNest.mutateAsync({
            platform: result.registration.platform,
            tokenHash: result.registration.tokenHash,
            expoPushToken: result.registration.expoPushToken,
          });
        } catch {
          // Patient registration already succeeded; platform copy is best-effort.
        }
      }

      return result;
    },
  });
}
