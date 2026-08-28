export const CONSENT_PURPOSES = [
  "TREATMENT",
  "CARE_COORDINATION",
  "ANALYTICS",
  "RESEARCH",
  "THIRD_PARTY_SHARING",
] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export const DATA_CATEGORIES = [
  "demographics",
  "vitals",
  "lab-like-readings",
  "appointments",
  "membership",
  "device-data",
] as const;

export type DataCategory = (typeof DATA_CATEGORIES)[number];

export const CURRENT_CONSENT_POLICY_VERSION = "2026-08-01";
