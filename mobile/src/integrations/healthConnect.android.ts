import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
  type RecordType,
} from "react-native-health-connect";

import type { HealthObservationInput } from "../shared";
import { HEALTH_CONNECT_CURSOR_KEY, readSyncCursor, writeSyncCursor } from "./health/cursor";
import {
  bloodPressureObservation,
  compactObservations,
  energyToKcal,
  glucoseToCanonical,
  hoursBetween,
  ingestInBatches,
  massToKg,
  numberField,
  pressureToMmhg,
  quantityObservation,
  stringField,
  syncWindow,
  temperatureToCelsius,
} from "./health/mapping";
import type { HealthAuthResult, HealthSyncContext, HealthSyncResult } from "./health/types";

const SOURCE = "GOOGLE_HEALTH_CONNECT" as const;

const RECORD_TYPES = [
  "Weight",
  "BloodPressure",
  "BloodGlucose",
  "HeartRate",
  "OxygenSaturation",
  "BodyTemperature",
  "Steps",
  "SleepSession",
  "ActiveCaloriesBurned",
] as const satisfies readonly RecordType[];

type SyncRecordType = (typeof RECORD_TYPES)[number];

const PERMISSIONS: Permission[] = RECORD_TYPES.flatMap((recordType) => [
  { accessType: "read", recordType },
  { accessType: "write", recordType },
]);

function sdkMessage(status: number): string {
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE) {
    return "Health Connect is not installed on this device. Install it from Play Store, then try again.";
  }
  if (status === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED) {
    return "Health Connect needs an update before Nova Thera can read your data.";
  }
  return "Health Connect is not available on this device.";
}

function metadataId(record: unknown, fallback: string): string {
  if (typeof record !== "object" || record === null) return fallback;
  const metadata = (record as { metadata?: unknown }).metadata;
  if (typeof metadata !== "object" || metadata === null) return fallback;
  const id = (metadata as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : fallback;
}

function grantedReadTypes(granted: readonly { accessType: string; recordType: string }[]): Set<SyncRecordType> {
  const allowed = new Set<SyncRecordType>();
  for (const permission of granted) {
    if (permission.accessType !== "read") continue;
    for (const type of RECORD_TYPES) {
      if (permission.recordType === type) allowed.add(type);
    }
  }
  return allowed;
}

async function readType(recordType: SyncRecordType, start: Date, end: Date): Promise<unknown[]> {
  try {
    const result = await readRecords(recordType, {
      timeRangeFilter: {
        operator: "between",
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      },
    });
    return result.records;
  } catch {
    return [];
  }
}

function mapRecords(recordType: SyncRecordType, records: unknown[]): HealthObservationInput[] {
  const rows: Array<HealthObservationInput | null> = [];

  for (const [index, record] of records.entries()) {
    const fallback = `hc-${recordType}-${index}`;
    const id = metadataId(record, fallback);

    if (recordType === "Weight") {
      const kg = massToKg((record as { weight?: unknown }).weight);
      const time = stringField(record, "time");
      if (kg === null || !time) continue;
      rows.push(
        quantityObservation({
          type: "WEIGHT",
          source: SOURCE,
          value: kg,
          unit: "kg",
          effectiveAt: time,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "BloodPressure") {
      const systolic = pressureToMmhg((record as { systolic?: unknown }).systolic);
      const diastolic = pressureToMmhg((record as { diastolic?: unknown }).diastolic);
      const time = stringField(record, "time");
      if (systolic === null || diastolic === null || !time) continue;
      rows.push(
        bloodPressureObservation({
          source: SOURCE,
          systolic,
          diastolic,
          effectiveAt: time,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "BloodGlucose") {
      const level = glucoseToCanonical((record as { level?: unknown }).level);
      const time = stringField(record, "time");
      if (!level || !time) continue;
      rows.push(
        quantityObservation({
          type: "BLOOD_GLUCOSE",
          source: SOURCE,
          value: level.value,
          unit: level.unit,
          effectiveAt: time,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "HeartRate") {
      const samples = (record as { samples?: unknown }).samples;
      if (!Array.isArray(samples)) continue;
      for (const [sampleIndex, sample] of samples.entries()) {
        const bpm = numberField(sample, "beatsPerMinute");
        const time = stringField(sample, "time") ?? stringField(record, "startTime");
        if (bpm === null || !time) continue;
        rows.push(
          quantityObservation({
            type: "HEART_RATE",
            source: SOURCE,
            value: bpm,
            unit: "beats/min",
            effectiveAt: time,
            sourceRecordId: `${id}-hr-${sampleIndex}`,
          }),
        );
      }
      continue;
    }

    if (recordType === "OxygenSaturation") {
      const percentage = numberField(record, "percentage");
      const time = stringField(record, "time");
      if (percentage === null || !time) continue;
      rows.push(
        quantityObservation({
          type: "SPO2",
          source: SOURCE,
          value: percentage <= 1 ? percentage * 100 : percentage,
          unit: "%",
          effectiveAt: time,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "BodyTemperature") {
      const converted = temperatureToCelsius((record as { temperature?: unknown }).temperature);
      const time = stringField(record, "time");
      if (!converted || !time) continue;
      rows.push(
        quantityObservation({
          type: "BODY_TEMPERATURE",
          source: SOURCE,
          value: converted.value,
          unit: converted.unit,
          effectiveAt: time,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "Steps") {
      const count = numberField(record, "count");
      const startTime = stringField(record, "startTime");
      if (count === null || !startTime) continue;
      rows.push(
        quantityObservation({
          type: "STEPS",
          source: SOURCE,
          value: count,
          unit: "{count}",
          effectiveAt: startTime,
          sourceRecordId: id,
        }),
      );
      continue;
    }

    if (recordType === "SleepSession") {
      const hours = hoursBetween(stringField(record, "startTime"), stringField(record, "endTime"));
      const startTime = stringField(record, "startTime");
      if (hours === null || !startTime) continue;
      rows.push(
        quantityObservation({
          type: "OTHER",
          source: SOURCE,
          value: hours,
          unit: "h",
          effectiveAt: startTime,
          sourceRecordId: `sleep:${id}`,
        }),
      );
      continue;
    }

    if (recordType === "ActiveCaloriesBurned") {
      const kcal = energyToKcal((record as { energy?: unknown }).energy);
      const startTime = stringField(record, "startTime");
      if (kcal === null || !startTime) continue;
      rows.push(
        quantityObservation({
          type: "OTHER",
          source: SOURCE,
          value: kcal,
          unit: "kcal",
          effectiveAt: startTime,
          sourceRecordId: `energy:${id}`,
        }),
      );
    }
  }

  return compactObservations(rows);
}

async function ensureSdk(): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const status = await getSdkStatus();
    if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
      return { ok: false, message: sdkMessage(status) };
    }
    const ready = await initialize();
    if (!ready) {
      return { ok: false, message: "Health Connect could not start on this device." };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "Health Connect is not available. Google Play services or the Health Connect app may be missing.",
    };
  }
}

async function syncWindowed(ctx: HealthSyncContext, firstGrant: boolean): Promise<HealthSyncResult> {
  const sdk = await ensureSdk();
  if (!sdk.ok) {
    return {
      available: false,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message: sdk.message,
    };
  }

  let granted: Awaited<ReturnType<typeof requestPermission>> = [];
  try {
    granted = await requestPermission(PERMISSIONS);
  } catch {
    return {
      available: true,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message: "Health Connect permission was denied or interrupted.",
    };
  }

  const readTypes = grantedReadTypes(granted);
  if (readTypes.size === 0) {
    try {
      const already = await getGrantedPermissions();
      for (const permission of already) {
        if (permission.accessType === "read") {
          for (const type of RECORD_TYPES) {
            if (permission.recordType === type) readTypes.add(type);
          }
        }
      }
    } catch {
      // Partial permissions stay empty; the user can retry.
    }
  }

  if (readTypes.size === 0) {
    return {
      available: true,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: true,
      message: "No Health Connect read permissions were granted. You can allow a subset and sync again.",
    };
  }

  const cursor = firstGrant ? null : await readSyncCursor(HEALTH_CONNECT_CURSOR_KEY);
  const { start, end } = syncWindow(cursor);
  const observations: HealthObservationInput[] = [];

  for (const recordType of readTypes) {
    const records = await readType(recordType, start, end);
    observations.push(...mapRecords(recordType, records));
  }

  const partial = readTypes.size < RECORD_TYPES.length;

  if (!ctx.treatmentConsent) {
    return {
      available: true,
      granted: true,
      pulled: observations.length,
      ingested: 0,
      skippedConsent: true,
      partial,
      message:
        "Health Connect permission is on, but treatment consent is off. Readings stay on the phone until you grant treatment consent.",
    };
  }

  const ingested = await ingestInBatches(observations, ctx.ingest);
  await writeSyncCursor(HEALTH_CONNECT_CURSOR_KEY, end.toISOString());

  return {
    available: true,
    granted: true,
    pulled: observations.length,
    ingested,
    skippedConsent: false,
    partial,
    message:
      ingested === 0
        ? "Connected. No new Health Connect readings in this window."
        : `Imported ${ingested} reading${ingested === 1 ? "" : "s"} from Health Connect.`,
  };
}

export async function requestHealthConnectAuthorization(): Promise<HealthAuthResult> {
  const sdk = await ensureSdk();
  if (!sdk.ok) return { available: false, granted: false, message: sdk.message };
  try {
    const granted = await requestPermission(PERMISSIONS);
    const readTypes = grantedReadTypes(granted);
    return {
      available: true,
      granted: readTypes.size > 0,
      message:
        readTypes.size === 0
          ? "Health Connect opened, but no read types were allowed."
          : readTypes.size < RECORD_TYPES.length
            ? "Connected with partial permissions. Nova Thera will sync only the types you allowed."
            : "Health Connect is connected.",
    };
  } catch {
    return {
      available: true,
      granted: false,
      message: "Health Connect permission was denied or interrupted.",
    };
  }
}

export async function syncHealthConnectRecords(ctx: HealthSyncContext): Promise<HealthSyncResult> {
  const cursor = await readSyncCursor(HEALTH_CONNECT_CURSOR_KEY);
  return syncWindowed(ctx, cursor === null);
}

export async function incrementalHealthConnectSync(ctx: HealthSyncContext): Promise<HealthSyncResult> {
  const cursor = await readSyncCursor(HEALTH_CONNECT_CURSOR_KEY);
  if (!cursor) {
    return {
      available: true,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message: "Connect Health Connect once to start incremental sync.",
    };
  }
  return syncWindowed(ctx, false);
}

export async function writeObservationToHealthConnect(input: HealthObservationInput): Promise<void> {
  const sdk = await ensureSdk();
  if (!sdk.ok) return;
  try {
    const time = input.effectiveAt;
    if (input.type === "WEIGHT" && input.valueQuantity !== undefined) {
      await insertRecords([
        { recordType: "Weight", time, weight: { value: input.valueQuantity, unit: "kilograms" } },
      ]);
      return;
    }
    if (input.type === "HEART_RATE" && input.valueQuantity !== undefined) {
      await insertRecords([
        {
          recordType: "HeartRate",
          startTime: time,
          endTime: time,
          samples: [{ time, beatsPerMinute: Math.round(input.valueQuantity) }],
        },
      ]);
      return;
    }
    if (input.type === "BLOOD_GLUCOSE" && input.valueQuantity !== undefined) {
      await insertRecords([
        {
          recordType: "BloodGlucose",
          time,
          level: { value: input.valueQuantity, unit: "millimolesPerLiter" },
          specimenSource: 0,
          mealType: 0,
          relationToMeal: 0,
        },
      ]);
      return;
    }
    if (input.type === "BODY_TEMPERATURE" && input.valueQuantity !== undefined) {
      await insertRecords([
        { recordType: "BodyTemperature", time, temperature: { value: input.valueQuantity, unit: "celsius" } },
      ]);
      return;
    }
    if (input.type === "SPO2" && input.valueQuantity !== undefined) {
      await insertRecords([{ recordType: "OxygenSaturation", time, percentage: input.valueQuantity }]);
      return;
    }
    if (input.type === "BLOOD_PRESSURE" && input.components && input.components.length >= 2) {
      const systolic = input.components[0]?.valueQuantity;
      const diastolic = input.components[1]?.valueQuantity;
      if (systolic === undefined || diastolic === undefined) return;
      await insertRecords([
        {
          recordType: "BloodPressure",
          time,
          systolic: { value: systolic, unit: "millimetersOfMercury" },
          diastolic: { value: diastolic, unit: "millimetersOfMercury" },
          bodyPosition: 0,
          measurementLocation: 0,
        },
      ]);
      return;
    }
    if (input.type === "STEPS" && input.valueQuantity !== undefined) {
      const endTime = new Date(Date.parse(time) + 60_000).toISOString();
      await insertRecords([
        {
          recordType: "Steps",
          startTime: time,
          endTime,
          count: Math.round(input.valueQuantity),
        },
      ]);
      return;
    }
    if (input.type === "OTHER" && input.valueUnit === "h" && input.valueQuantity !== undefined) {
      const endTime = new Date(Date.parse(time) + input.valueQuantity * 3_600_000).toISOString();
      await insertRecords([
        { recordType: "SleepSession", startTime: time, endTime },
      ]);
      return;
    }
    if (input.type === "OTHER" && input.valueUnit === "kcal" && input.valueQuantity !== undefined) {
      const endTime = new Date(Date.parse(time) + 60_000).toISOString();
      await insertRecords([
        {
          recordType: "ActiveCaloriesBurned",
          startTime: time,
          endTime,
          energy: { value: input.valueQuantity, unit: "kilocalories" },
        },
      ]);
    }
  } catch {
    // Write is best-effort; a missing permission must not fail ingest.
  }
}
