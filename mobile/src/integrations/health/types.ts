import type { HealthObservationInput } from "../../shared";

export type HealthAuthResult = {
  available: boolean;
  granted: boolean;
  message: string;
};

export type HealthSyncResult = {
  available: boolean;
  granted: boolean;
  pulled: number;
  ingested: number;
  skippedConsent: boolean;
  partial: boolean;
  message: string;
};

export type HealthIngestFn = (observations: HealthObservationInput[]) => Promise<unknown>;

export type HealthSyncContext = {
  treatmentConsent: boolean;
  ingest: HealthIngestFn;
};

export const FIRST_SYNC_MS = 30 * 24 * 60 * 60 * 1000;
export const INGEST_BATCH_SIZE = 50;

export const LOINC_SYSTOLIC = "8480-6";
export const LOINC_DIASTOLIC = "8462-4";
