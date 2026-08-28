import AppleHealthKit, {
  HealthPermission,
  HealthUnit,
  type BloodPressureSampleValue,
  type HealthInputOptions,
  type HealthKitPermissions,
  type HealthValue,
} from "react-native-health";

import type { HealthObservationInput } from "../shared";
import { HEALTHKIT_CURSOR_KEY, readSyncCursor, writeSyncCursor } from "./health/cursor";
import {
  bloodPressureObservation,
  compactObservations,
  hoursBetween,
  ingestInBatches,
  isAsleepCategory,
  quantityObservation,
  syncWindow,
} from "./health/mapping";
import type { HealthAuthResult, HealthSyncContext, HealthSyncResult } from "./health/types";

const SOURCE = "APPLE_HEALTHKIT" as const;

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      HealthPermission.Weight,
      HealthPermission.BloodPressureSystolic,
      HealthPermission.BloodPressureDiastolic,
      HealthPermission.BloodGlucose,
      HealthPermission.HeartRate,
      HealthPermission.OxygenSaturation,
      HealthPermission.BodyTemperature,
      HealthPermission.StepCount,
      HealthPermission.SleepAnalysis,
      HealthPermission.ActiveEnergyBurned,
    ],
    write: [
      HealthPermission.Weight,
      HealthPermission.BloodPressureSystolic,
      HealthPermission.BloodPressureDiastolic,
      HealthPermission.BloodGlucose,
      HealthPermission.HeartRate,
      HealthPermission.OxygenSaturation,
      HealthPermission.BodyTemperature,
      HealthPermission.StepCount,
      HealthPermission.SleepAnalysis,
      HealthPermission.ActiveEnergyBurned,
    ],
  },
};

function asErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.length > 0) return error;
  if (error instanceof Error && error.message) return error.message;
  return "HealthKit is not available on this device.";
}

function samples<T>(
  fn: (options: HealthInputOptions, callback: (err: string, results: T[]) => void) => void,
  options: HealthInputOptions,
): Promise<T[]> {
  return new Promise((resolve) => {
    try {
      fn(options, (err, results) => {
        if (err) {
          resolve([]);
          return;
        }
        resolve(Array.isArray(results) ? results : []);
      });
    } catch {
      resolve([]);
    }
  });
}

function isAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      AppleHealthKit.isAvailable((_error, available) => {
        resolve(Boolean(available));
      });
    } catch {
      resolve(false);
    }
  });
}

function initKit(): Promise<void> {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
      if (error) reject(new Error(asErrorMessage(error)));
      else resolve();
    });
  });
}

function recordId(sample: { id?: string }, fallback: string): string {
  return sample.id && sample.id.length > 0 ? sample.id : fallback;
}

async function pullObservations(start: Date, end: Date): Promise<HealthObservationInput[]> {
  const range: HealthInputOptions = {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    ascending: true,
  };

  const [
    weights,
    pressures,
    glucose,
    heartRates,
    spo2,
    temps,
    steps,
    sleeps,
    energy,
  ] = await Promise.all([
    samples<HealthValue>(AppleHealthKit.getWeightSamples.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.gram,
    }),
    samples<BloodPressureSampleValue>(AppleHealthKit.getBloodPressureSamples.bind(AppleHealthKit), range),
    samples<HealthValue>(AppleHealthKit.getBloodGlucoseSamples.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.mmolPerL,
    }),
    samples<HealthValue>(AppleHealthKit.getHeartRateSamples.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.bpm,
    }),
    samples<HealthValue>(AppleHealthKit.getOxygenSaturationSamples.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.percent,
    }),
    samples<HealthValue>(AppleHealthKit.getBodyTemperatureSamples.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.celsius,
    }),
    samples<HealthValue>(AppleHealthKit.getDailyStepCountSamples.bind(AppleHealthKit), range),
    samples<HealthValue>(AppleHealthKit.getSleepSamples.bind(AppleHealthKit), range),
    samples<HealthValue>(AppleHealthKit.getActiveEnergyBurned.bind(AppleHealthKit), {
      ...range,
      unit: HealthUnit.kilocalorie,
    }),
  ]);

  const weightObs = weights.map((sample, index) =>
    quantityObservation({
      type: "WEIGHT",
      source: SOURCE,
      value: sample.value,
      unit: "g",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-weight-${sample.startDate}-${index}`),
    }),
  );

  const bpObs = pressures.map((sample, index) =>
    bloodPressureObservation({
      source: SOURCE,
      systolic: sample.bloodPressureSystolicValue,
      diastolic: sample.bloodPressureDiastolicValue,
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-bp-${sample.startDate}-${index}`),
    }),
  );

  const glucoseObs = glucose.map((sample, index) =>
    quantityObservation({
      type: "BLOOD_GLUCOSE",
      source: SOURCE,
      value: sample.value,
      unit: "mmol/L",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-glucose-${sample.startDate}-${index}`),
    }),
  );

  const hrObs = heartRates.map((sample, index) =>
    quantityObservation({
      type: "HEART_RATE",
      source: SOURCE,
      value: sample.value,
      unit: "beats/min",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-hr-${sample.startDate}-${index}`),
    }),
  );

  const spo2Obs = spo2.map((sample, index) =>
    quantityObservation({
      type: "SPO2",
      source: SOURCE,
      value: sample.value <= 1 ? sample.value * 100 : sample.value,
      unit: "%",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-spo2-${sample.startDate}-${index}`),
    }),
  );

  const tempObs = temps.map((sample, index) =>
    quantityObservation({
      type: "BODY_TEMPERATURE",
      source: SOURCE,
      value: sample.value,
      unit: "Cel",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-temp-${sample.startDate}-${index}`),
    }),
  );

  const stepObs = steps.map((sample, index) =>
    quantityObservation({
      type: "STEPS",
      source: SOURCE,
      value: sample.value,
      unit: "{count}",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-steps-${sample.startDate}-${index}`),
    }),
  );

  const sleepObs = sleeps.flatMap((sample, index) => {
    if (!isAsleepCategory(sample.value)) return [];
    const hours = hoursBetween(sample.startDate, sample.endDate);
    if (hours === null) return [];
    const row = quantityObservation({
      type: "OTHER",
      source: SOURCE,
      value: hours,
      unit: "h",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-sleep-${sample.startDate}-${index}`),
    });
    return row ? [row] : [];
  });

  const energyObs = energy.map((sample, index) =>
    quantityObservation({
      type: "OTHER",
      source: SOURCE,
      value: sample.value,
      unit: "kcal",
      effectiveAt: sample.startDate,
      sourceRecordId: recordId(sample, `hk-energy-${sample.startDate}-${index}`),
    }),
  );

  return compactObservations([
    ...weightObs,
    ...bpObs,
    ...glucoseObs,
    ...hrObs,
    ...spo2Obs,
    ...tempObs,
    ...stepObs,
    ...sleepObs,
    ...energyObs,
  ]);
}

async function syncWindowed(ctx: HealthSyncContext, firstGrant: boolean): Promise<HealthSyncResult> {
  const available = await isAvailable();
  if (!available) {
    return {
      available: false,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message:
        "HealthKit is not available. A physical iPhone and a development or preview build are required — Expo Go cannot load this module.",
    };
  }

  try {
    await initKit();
  } catch (error) {
    return {
      available: true,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message: asErrorMessage(error),
    };
  }

  const cursor = firstGrant ? null : await readSyncCursor(HEALTHKIT_CURSOR_KEY);
  const { start, end } = syncWindow(cursor);
  const observations = await pullObservations(start, end);

  if (!ctx.treatmentConsent) {
    return {
      available: true,
      granted: true,
      pulled: observations.length,
      ingested: 0,
      skippedConsent: true,
      partial: false,
      message:
        "Apple Health permission is on, but treatment consent is off. Readings stay on the phone until you grant treatment consent.",
    };
  }

  const ingested = await ingestInBatches(observations, ctx.ingest);
  await writeSyncCursor(HEALTHKIT_CURSOR_KEY, end.toISOString());

  return {
    available: true,
    granted: true,
    pulled: observations.length,
    ingested,
    skippedConsent: false,
    partial: false,
    message:
      ingested === 0
        ? "Connected. No new Health readings in this window."
        : `Imported ${ingested} reading${ingested === 1 ? "" : "s"} from Apple Health.`,
  };
}

export async function requestHealthKitAuthorization(): Promise<HealthAuthResult> {
  const available = await isAvailable();
  if (!available) {
    return {
      available: false,
      granted: false,
      message:
        "HealthKit is not available on this device. Use a physical iPhone with a Nova Thera iOS build.",
    };
  }
  try {
    await initKit();
    return {
      available: true,
      granted: true,
      message: "Apple Health is connected. Selected vitals can sync into your record.",
    };
  } catch (error) {
    return { available: true, granted: false, message: asErrorMessage(error) };
  }
}

export async function syncHealthKitSamples(ctx: HealthSyncContext): Promise<HealthSyncResult> {
  const cursor = await readSyncCursor(HEALTHKIT_CURSOR_KEY);
  return syncWindowed(ctx, cursor === null);
}

export async function incrementalHealthKitSync(ctx: HealthSyncContext): Promise<HealthSyncResult> {
  const cursor = await readSyncCursor(HEALTHKIT_CURSOR_KEY);
  if (!cursor) {
    return {
      available: true,
      granted: false,
      pulled: 0,
      ingested: 0,
      skippedConsent: false,
      partial: false,
      message: "Connect Apple Health once to start incremental sync.",
    };
  }
  return syncWindowed(ctx, false);
}

export async function writeObservationToHealthKit(input: HealthObservationInput): Promise<void> {
  const available = await isAvailable();
  if (!available) return;
  try {
    await initKit();
  } catch {
    return;
  }

  const date = input.effectiveAt;
  await new Promise<void>((resolve) => {
    const done = () => resolve();
    try {
      if (input.type === "WEIGHT" && input.valueQuantity !== undefined) {
        AppleHealthKit.saveWeight(
          { value: input.valueQuantity * 1000, unit: HealthUnit.gram, startDate: date, endDate: date },
          () => done(),
        );
        return;
      }
      if (input.type === "HEART_RATE" && input.valueQuantity !== undefined) {
        AppleHealthKit.saveHeartRateSample(
          { value: input.valueQuantity, unit: HealthUnit.bpm, startDate: date, endDate: date },
          () => done(),
        );
        return;
      }
      if (input.type === "BLOOD_GLUCOSE" && input.valueQuantity !== undefined) {
        AppleHealthKit.saveBloodGlucoseSample(
          { value: input.valueQuantity, unit: HealthUnit.mmolPerL, startDate: date, endDate: date },
          () => done(),
        );
        return;
      }
      if (input.type === "BODY_TEMPERATURE" && input.valueQuantity !== undefined) {
        AppleHealthKit.saveBodyTemperature(
          { value: input.valueQuantity, unit: HealthUnit.celsius, startDate: date, endDate: date },
          () => done(),
        );
        return;
      }
      if (input.type === "STEPS" && input.valueQuantity !== undefined) {
        AppleHealthKit.saveSteps(
          { value: input.valueQuantity, startDate: date, endDate: date },
          () => done(),
        );
        return;
      }
      done();
    } catch {
      done();
    }
  });
}
