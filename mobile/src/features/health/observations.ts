import { CANONICAL_UNITS, type ObservationSource, type ObservationType } from "../../shared";

/**
 * A row from `health.list` after coercion.
 *
 * The router selects `valueNormalized`, which Prisma types as `Decimal`. There
 * is no superjson custom transformer registered for it on either side, so the
 * value crosses the wire as whatever `Decimal.toJSON` produces — a string. The
 * declared type and the runtime type disagree, so the raw row is read through
 * `unknown` and coerced here instead of being trusted.
 */
export type Observation = {
  id: string;
  type: ObservationType;
  value: number | null;
  unit: string | null;
  effectiveAt: Date;
  source: ObservationSource;
};

type RawObservation = {
  id: string;
  type: ObservationType;
  valueNormalized: unknown;
  unitNormalized: string | null;
  effectiveAt: unknown;
  source: ObservationSource;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    return value.trim() !== "" && Number.isFinite(parsed) ? parsed : null;
  }
  // Decimal instances survive as objects only if a transformer revives them.
  if (typeof value === "object" && value !== null) {
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return new Date(Number.NaN);
}

export function toObservation(row: RawObservation): Observation {
  return {
    id: row.id,
    type: row.type,
    value: toFiniteNumber(row.valueNormalized),
    unit: row.unitNormalized,
    effectiveAt: toDate(row.effectiveAt),
    source: row.source,
  };
}

export function toObservations(rows: readonly RawObservation[]): Observation[] {
  return rows.map(toObservation).filter((row) => !Number.isNaN(row.effectiveAt.getTime()));
}

export const OBSERVATION_LABELS: Record<ObservationType, string> = {
  WEIGHT: "Weight",
  BLOOD_PRESSURE: "Blood pressure",
  BLOOD_GLUCOSE: "Blood glucose",
  HEART_RATE: "Heart rate",
  SPO2: "Blood oxygen",
  BODY_TEMPERATURE: "Temperature",
  PAIN: "Pain score",
  HEIGHT: "Height",
  RESPIRATORY_RATE: "Respiratory rate",
  STEPS: "Steps",
  OTHER: "Other reading",
};

/** Short forms for chips and axis captions where the full label will not fit. */
export const OBSERVATION_SHORT_LABELS: Record<ObservationType, string> = {
  WEIGHT: "Weight",
  BLOOD_PRESSURE: "BP",
  BLOOD_GLUCOSE: "Glucose",
  HEART_RATE: "Pulse",
  SPO2: "SpO₂",
  BODY_TEMPERATURE: "Temp",
  PAIN: "Pain",
  HEIGHT: "Height",
  RESPIRATORY_RATE: "Resp. rate",
  STEPS: "Steps",
  OTHER: "Other",
};

const DECIMAL_PLACES: Record<ObservationType, number> = {
  WEIGHT: 1,
  BLOOD_PRESSURE: 0,
  BLOOD_GLUCOSE: 1,
  HEART_RATE: 0,
  SPO2: 0,
  BODY_TEMPERATURE: 1,
  PAIN: 0,
  HEIGHT: 0,
  RESPIRATORY_RATE: 0,
  STEPS: 0,
  OTHER: 1,
};

/** UCUM codes are stored verbatim, but they read badly in a patient-facing UI. */
const UNIT_LABELS: Record<string, string> = {
  "beats/min": "bpm",
  Cel: "°C",
  "{score}": "",
  "{count}": "steps",
  "/min": "breaths/min",
};

export function formatUnit(type: ObservationType, unit: string | null): string {
  const raw = unit ?? CANONICAL_UNITS[type];
  if (raw === null || raw === undefined) return "";
  return UNIT_LABELS[raw] ?? raw;
}

export function formatValue(type: ObservationType, value: number): string {
  const places = DECIMAL_PLACES[type];
  if (type === "STEPS") return Math.round(value).toLocaleString();
  return value.toFixed(places);
}

/**
 * Blood pressure is two numbers. `health.list` selects `valueNormalized` only,
 * and `ingest` leaves that column NULL whenever the reading arrived as
 * systolic/diastolic components, so this screen can never reconstruct "120/80".
 * Charting a half-present scalar would be worse than not charting it.
 */
export function isChartable(type: ObservationType): boolean {
  return type !== "BLOOD_PRESSURE" && type !== "OTHER";
}

export function hasSplitComponents(type: ObservationType): boolean {
  return type === "BLOOD_PRESSURE";
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const elapsed = now.getTime() - date.getTime();
  if (!Number.isFinite(elapsed)) return "Unknown time";
  if (elapsed < 0) return "Scheduled";
  if (elapsed < MINUTE) return "Just now";
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export type ObservationStats = {
  latest: number;
  min: number;
  max: number;
  average: number;
  count: number;
};

/** Order-independent: `latest` is picked by `effectiveAt`, not array position. */
export function summarize(observations: readonly Observation[]): ObservationStats | null {
  let latest: Observation | null = null;
  let min: number | null = null;
  let max: number | null = null;
  let total = 0;
  let count = 0;

  for (const observation of observations) {
    if (observation.value === null) continue;
    if (latest === null || observation.effectiveAt > latest.effectiveAt) latest = observation;
    if (min === null || observation.value < min) min = observation.value;
    if (max === null || observation.value > max) max = observation.value;
    total += observation.value;
    count += 1;
  }

  if (latest === null || latest.value === null || min === null || max === null) return null;
  return { latest: latest.value, min, max, average: total / count, count };
}
