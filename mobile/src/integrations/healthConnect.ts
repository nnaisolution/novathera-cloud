import type { HealthObservationInput } from "../shared";
import type { HealthAuthResult, HealthSyncContext, HealthSyncResult } from "./health/types";

const WEB_OR_IOS: HealthAuthResult = {
  available: false,
  granted: false,
  message:
    "Health Connect runs on Android only. Open this screen on a Nova Thera Android build — not a browser, and not Expo Go.",
};

const EMPTY_SYNC: HealthSyncResult = {
  available: false,
  granted: false,
  pulled: 0,
  ingested: 0,
  skippedConsent: false,
  partial: false,
  message: WEB_OR_IOS.message,
};

export async function requestHealthConnectAuthorization(): Promise<HealthAuthResult> {
  return WEB_OR_IOS;
}

export async function syncHealthConnectRecords(_ctx: HealthSyncContext): Promise<HealthSyncResult> {
  return EMPTY_SYNC;
}

export async function incrementalHealthConnectSync(_ctx: HealthSyncContext): Promise<HealthSyncResult> {
  return EMPTY_SYNC;
}

export async function writeObservationToHealthConnect(_input: HealthObservationInput): Promise<void> {
  return;
}
