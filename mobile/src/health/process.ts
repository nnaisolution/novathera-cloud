import * as Crypto from "expo-crypto";
import type { HealthObservationInput, ObservationType } from "../shared";
import { CANONICAL_UNITS, LOINC_CODES } from "../shared";

const PHYSIOLOGIC_RANGES: Record<ObservationType, { min: number; max: number } | null> = {
  WEIGHT: { min: 1, max: 400 },
  BLOOD_PRESSURE: { min: 40, max: 260 },
  BLOOD_GLUCOSE: { min: 1, max: 40 },
  HEART_RATE: { min: 20, max: 250 },
  SPO2: { min: 50, max: 100 },
  BODY_TEMPERATURE: { min: 30, max: 45 },
  PAIN: { min: 0, max: 10 },
  HEIGHT: { min: 30, max: 250 },
  RESPIRATORY_RATE: { min: 4, max: 80 },
  STEPS: { min: 0, max: 200000 },
  OTHER: null,
};

export function validateObservation(input: HealthObservationInput): string[] {
  const errors: string[] = [];
  if (!input.effectiveAt || Number.isNaN(Date.parse(input.effectiveAt))) {
    errors.push("effectiveAt must be a valid ISO timestamp");
  }
  if (input.effectiveAt && Date.parse(input.effectiveAt) > Date.now() + 5 * 60 * 1000) {
    errors.push("effectiveAt cannot be in the future");
  }
  if (input.type === "BLOOD_PRESSURE") {
    if (!input.components || input.components.length < 2) {
      errors.push("blood pressure requires systolic and diastolic components");
    }
  } else if (input.valueQuantity === undefined) {
    errors.push("valueQuantity is required");
  }
  const range = PHYSIOLOGIC_RANGES[input.type];
  if (range && input.valueQuantity !== undefined) {
    if (input.valueQuantity < range.min || input.valueQuantity > range.max) {
      errors.push("value is outside accepted physiologic range");
    }
  }
  if (range && input.components?.length) {
    for (const component of input.components) {
      if (component.valueQuantity < range.min || component.valueQuantity > range.max) {
        errors.push("value is outside accepted physiologic range");
        break;
      }
    }
  }
  return errors;
}

export function normalizeUnit(type: ObservationType, value: number, unit?: string): {
  valueNormalized: number;
  unitNormalized: string | null;
} {
  const canonical = CANONICAL_UNITS[type];
  if (!canonical) {
    return { valueNormalized: value, unitNormalized: unit ?? null };
  }
  const u = (unit ?? canonical).toLowerCase();
  if (type === "WEIGHT" && (u === "lb" || u === "lbs" || u === "pound" || u === "pounds")) {
    return { valueNormalized: value * 0.45359237, unitNormalized: "kg" };
  }
  if (type === "WEIGHT" && (u === "g" || u === "gram" || u === "grams")) {
    return { valueNormalized: value / 1000, unitNormalized: "kg" };
  }
  if (type === "BODY_TEMPERATURE" && (u === "f" || u === "[degf]")) {
    return { valueNormalized: ((value - 32) * 5) / 9, unitNormalized: "Cel" };
  }
  if (type === "BLOOD_GLUCOSE" && u === "mg/dl") {
    return { valueNormalized: value / 18.0182, unitNormalized: "mmol/L" };
  }
  if (type === "HEIGHT" && u === "in") {
    return { valueNormalized: value * 2.54, unitNormalized: "cm" };
  }
  return { valueNormalized: value, unitNormalized: canonical };
}

export async function contentHash(input: HealthObservationInput): Promise<string> {
  const payload = JSON.stringify({
    type: input.type,
    effectiveAt: input.effectiveAt,
    valueQuantity: input.valueQuantity ?? null,
    valueUnit: input.valueUnit ?? null,
    components: input.components ?? null,
    source: input.source,
    sourceRecordId: input.sourceRecordId ?? null,
  });
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, payload);
}

export async function toNormalizedObservation(input: HealthObservationInput) {
  const quantity = input.valueQuantity ?? 0;
  const normalized = input.valueQuantity !== undefined
    ? normalizeUnit(input.type, quantity, input.valueUnit)
    : { valueNormalized: undefined, unitNormalized: CANONICAL_UNITS[input.type] };
  return {
    ...input,
    loincCode: LOINC_CODES[input.type],
    fhirCategory: input.type === "PAIN" ? "survey" : input.type === "STEPS" ? "activity" : "vital-signs",
    ...normalized,
    contentHash: await contentHash(input),
  };
}
