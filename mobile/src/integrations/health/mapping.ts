import type { HealthObservationInput, ObservationSource, ObservationType } from "../../shared";
import { normalizeUnit, validateObservation } from "../../health/process";
import { FIRST_SYNC_MS, INGEST_BATCH_SIZE, LOINC_DIASTOLIC, LOINC_SYSTOLIC } from "./types";
import type { HealthIngestFn } from "./types";

export function syncWindow(cursorIso: string | null, now: Date = new Date()): { start: Date; end: Date } {
  const parsed = cursorIso ? Date.parse(cursorIso) : Number.NaN;
  const start = Number.isFinite(parsed) ? new Date(parsed) : new Date(now.getTime() - FIRST_SYNC_MS);
  return { start, end: now };
}

export async function ingestInBatches(
  observations: HealthObservationInput[],
  ingest: HealthIngestFn,
): Promise<number> {
  let ingested = 0;
  for (let index = 0; index < observations.length; index += INGEST_BATCH_SIZE) {
    const batch = observations.slice(index, index + INGEST_BATCH_SIZE);
    await ingest(batch);
    ingested += batch.length;
  }
  return ingested;
}

function isoFromUnknown(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value.toISOString();
  if (typeof value === "string" && Number.isFinite(Date.parse(value))) return new Date(value).toISOString();
  return null;
}

export function quantityObservation(input: {
  type: ObservationType;
  source: ObservationSource;
  value: number;
  unit: string;
  effectiveAt: unknown;
  sourceRecordId: string;
}): HealthObservationInput | null {
  const effectiveAt = isoFromUnknown(input.effectiveAt);
  if (!effectiveAt) return null;
  const canonical = normalizeUnit(input.type, input.value, input.unit);
  const observation: HealthObservationInput = {
    type: input.type,
    source: input.source,
    effectiveAt,
    valueQuantity: canonical.valueNormalized,
    valueUnit: canonical.unitNormalized ?? input.unit,
    sourceRecordId: input.sourceRecordId,
    status: "FINAL",
  };
  return validateObservation(observation).length === 0 ? observation : null;
}

export function bloodPressureObservation(input: {
  source: ObservationSource;
  systolic: number;
  diastolic: number;
  effectiveAt: unknown;
  sourceRecordId: string;
}): HealthObservationInput | null {
  const effectiveAt = isoFromUnknown(input.effectiveAt);
  if (!effectiveAt) return null;
  const observation: HealthObservationInput = {
    type: "BLOOD_PRESSURE",
    source: input.source,
    effectiveAt,
    components: [
      { code: LOINC_SYSTOLIC, valueQuantity: input.systolic, unit: "mmHg" },
      { code: LOINC_DIASTOLIC, valueQuantity: input.diastolic, unit: "mmHg" },
    ],
    sourceRecordId: input.sourceRecordId,
    status: "FINAL",
  };
  return validateObservation(observation).length === 0 ? observation : null;
}

export function compactObservations(rows: Array<HealthObservationInput | null>): HealthObservationInput[] {
  return rows.filter((row): row is HealthObservationInput => row !== null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function numberField(value: unknown, key: string): number | null {
  if (!isRecord(value)) return null;
  const candidate = value[key];
  return typeof candidate === "number" && Number.isFinite(candidate) ? candidate : null;
}

export function stringField(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;
  const candidate = value[key];
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

/** Health Connect `Mass` write shape or `MassResult` read shape. */
export function massToKg(mass: unknown): number | null {
  if (!isRecord(mass)) return null;
  if (typeof mass.inKilograms === "number" && Number.isFinite(mass.inKilograms)) return mass.inKilograms;
  if (typeof mass.value !== "number" || !Number.isFinite(mass.value)) return null;
  const unit = typeof mass.unit === "string" ? mass.unit : "kilograms";
  if (unit === "kilograms") return mass.value;
  if (unit === "grams") return mass.value / 1000;
  if (unit === "pounds") return mass.value * 0.45359237;
  if (unit === "ounces") return mass.value * 0.028349523125;
  if (unit === "milligrams") return mass.value / 1_000_000;
  return null;
}

export function pressureToMmhg(pressure: unknown): number | null {
  if (!isRecord(pressure)) return null;
  if (typeof pressure.inMillimetersOfMercury === "number" && Number.isFinite(pressure.inMillimetersOfMercury)) {
    return pressure.inMillimetersOfMercury;
  }
  if (typeof pressure.value === "number" && Number.isFinite(pressure.value)) return pressure.value;
  return null;
}

export function temperatureToCelsius(temperature: unknown): { value: number; unit: string } | null {
  if (!isRecord(temperature)) return null;
  if (typeof temperature.inCelsius === "number" && Number.isFinite(temperature.inCelsius)) {
    return { value: temperature.inCelsius, unit: "Cel" };
  }
  if (typeof temperature.value !== "number" || !Number.isFinite(temperature.value)) return null;
  const unit = typeof temperature.unit === "string" ? temperature.unit : "celsius";
  if (unit === "fahrenheit") return { value: temperature.value, unit: "F" };
  return { value: temperature.value, unit: "Cel" };
}

export function glucoseToCanonical(level: unknown): { value: number; unit: string } | null {
  if (!isRecord(level)) return null;
  if (typeof level.inMillimolesPerLiter === "number" && Number.isFinite(level.inMillimolesPerLiter)) {
    return { value: level.inMillimolesPerLiter, unit: "mmol/L" };
  }
  if (typeof level.inMilligramsPerDeciliter === "number" && Number.isFinite(level.inMilligramsPerDeciliter)) {
    return { value: level.inMilligramsPerDeciliter, unit: "mg/dL" };
  }
  if (typeof level.value !== "number" || !Number.isFinite(level.value)) return null;
  const unit = typeof level.unit === "string" ? level.unit : "millimolesPerLiter";
  if (unit === "milligramsPerDeciliter") return { value: level.value, unit: "mg/dL" };
  return { value: level.value, unit: "mmol/L" };
}

export function energyToKcal(energy: unknown): number | null {
  if (!isRecord(energy)) return null;
  if (typeof energy.inKilocalories === "number" && Number.isFinite(energy.inKilocalories)) {
    return energy.inKilocalories;
  }
  if (typeof energy.value !== "number" || !Number.isFinite(energy.value)) return null;
  const unit = typeof energy.unit === "string" ? energy.unit : "kilocalories";
  if (unit === "calories") return energy.value / 1000;
  if (unit === "joules") return energy.value / 4184;
  if (unit === "kilojoules") return energy.value / 4.184;
  return energy.value;
}

export function hoursBetween(start: unknown, end: unknown): number | null {
  const startIso = isoFromUnknown(start);
  const endIso = isoFromUnknown(end);
  if (!startIso || !endIso) return null;
  const hours = (Date.parse(endIso) - Date.parse(startIso)) / 3_600_000;
  if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return null;
  return hours;
}

export function isAsleepCategory(value: unknown): boolean {
  if (typeof value !== "string") return true;
  const normalized = value.toUpperCase();
  if (normalized.includes("AWAKE") || normalized === "INBED" || normalized === "IN_BED") return false;
  return true;
}
