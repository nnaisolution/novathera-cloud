import { useCallback, useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";

import { useAuth } from "../../../auth/AuthProvider";
import { isConsentActive, latestByPurpose } from "../../consent/consent";
import { useConsentList } from "../../consent/hooks/useConsent";
import { useIngestObservations } from "./useIngestObservations";
import { incrementalHealthConnectSync } from "../../../integrations/healthConnect";
import { incrementalHealthKitSync } from "../../../integrations/healthkit";
import type { HealthSyncContext } from "../../../integrations/health/types";

/**
 * After the patient has connected a native health source once, pull new
 * samples when the app becomes active. No-ops on web and when treatment
 * consent is off (the native modules still skip ingest in that case).
 */
export function useDeviceHealthSync() {
  const { status } = useAuth();
  const consent = useConsentList();
  const ingest = useIngestObservations();
  const inFlight = useRef(false);

  const run = useCallback(async () => {
    if (status !== "signedIn" || inFlight.current) return;
    if (Platform.OS !== "ios" && Platform.OS !== "android") return;

    const treatmentConsent = isConsentActive(latestByPurpose(consent.data ?? []).get("TREATMENT"));
    const ctx: HealthSyncContext = {
      treatmentConsent,
      ingest: (observations) => ingest.mutateAsync({ observations }),
    };

    inFlight.current = true;
    try {
      if (Platform.OS === "ios") await incrementalHealthKitSync(ctx);
      if (Platform.OS === "android") await incrementalHealthConnectSync(ctx);
    } catch {
      // Incremental sync is best-effort; the sources screen surfaces errors.
    } finally {
      inFlight.current = false;
    }
  }, [consent.data, ingest, status]);

  useEffect(() => {
    void run();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") void run();
    });
    return () => sub.remove();
  }, [run]);
}
