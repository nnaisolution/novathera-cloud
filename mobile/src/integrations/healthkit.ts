import type { HealthObservationInput } from "../shared";
import type { HealthAuthResult, HealthSyncContext, HealthSyncResult } from "./health/types";

const WEB_OR_ANDROID: HealthAuthResult = {
  available: false,
  granted: false,
  message:
    "Apple Health runs on iPhone only. Open this screen on a Nova Thera iOS build — not a browser, and not Expo Go.",
};

const EMPTY_SYNC: HealthSyncResult = {
  available: false,
  granted: false,
  pulled: 0,
  ingested: 0,
  skippedConsent: false,
  partial: false,
  message: WEB_OR_ANDROID.message,
};

export async function requestHealthKitAuthorization(): Promise<HealthAuthResult> {
  return WEB_OR_ANDROID;
}

export async function syncHealthKitSamples(_ctx: HealthSyncContext): Promise<HealthSyncResult> {
  return EMPTY_SYNC;
}

export async function incrementalHealthKitSync(_ctx: HealthSyncContext): Promise<HealthSyncResult> {
  return EMPTY_SYNC;
}

export async function writeObservationToHealthKit(_input: HealthObservationInput): Promise<void> {
  return;
}
