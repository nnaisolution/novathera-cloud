export const OBSERVATION_TYPES = [
  "WEIGHT",
  "BLOOD_PRESSURE",
  "BLOOD_GLUCOSE",
  "HEART_RATE",
  "SPO2",
  "BODY_TEMPERATURE",
  "PAIN",
  "HEIGHT",
  "RESPIRATORY_RATE",
  "STEPS",
  "OTHER",
] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];

export const OBSERVATION_SOURCES = [
  "MANUAL",
  "APPLE_HEALTHKIT",
  "GOOGLE_HEALTH_CONNECT",
] as const;

export type ObservationSource = (typeof OBSERVATION_SOURCES)[number];

export const OBSERVATION_STATUSES = [
  "PRELIMINARY",
  "FINAL",
  "ENTERED_IN_ERROR",
] as const;

export type ObservationStatus = (typeof OBSERVATION_STATUSES)[number];

export const CANONICAL_UNITS: Record<ObservationType, string | null> = {
  WEIGHT: "kg",
  BLOOD_PRESSURE: "mmHg",
  BLOOD_GLUCOSE: "mmol/L",
  HEART_RATE: "beats/min",
  SPO2: "%",
  BODY_TEMPERATURE: "Cel",
  PAIN: "{score}",
  HEIGHT: "cm",
  RESPIRATORY_RATE: "/min",
  STEPS: "{count}",
  OTHER: null,
};

export const LOINC_CODES: Partial<Record<ObservationType, string>> = {
  WEIGHT: "29463-7",
  BLOOD_PRESSURE: "85354-9",
  BLOOD_GLUCOSE: "2339-0",
  HEART_RATE: "8867-4",
  SPO2: "2708-6",
  BODY_TEMPERATURE: "8310-5",
  PAIN: "72514-3",
  HEIGHT: "8302-2",
  RESPIRATORY_RATE: "9279-1",
  STEPS: "55423-8",
};

export type ObservationComponent = {
  code: string;
  valueQuantity: number;
  unit: string;
};

export type HealthObservationInput = {
  type: ObservationType;
  source: ObservationSource;
  effectiveAt: string;
  valueQuantity?: number;
  valueUnit?: string;
  components?: ObservationComponent[];
  sourceRecordId?: string;
  status?: ObservationStatus;
};

export type NormalizedHealthObservation = HealthObservationInput & {
  loincCode?: string;
  fhirCategory: "vital-signs" | "survey" | "activity";
  valueNormalized?: number;
  unitNormalized?: string;
  contentHash: string;
};
