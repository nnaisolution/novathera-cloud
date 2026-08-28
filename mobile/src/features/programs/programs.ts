import type { inferRouterOutputs } from "@trpc/server";

import type { PatientAppRouter } from "../../api/patient-client";
import type { ChipTone } from "../../components/Chip";

type PatientOutputs = inferRouterOutputs<PatientAppRouter>;

/** One row from `programs.list`, including the nested treatment program. */
export type ProgramEnrollment = PatientOutputs["programs"]["list"][number];

export type EnrollmentKind = "treatment" | "aftercare";

export function isAftercareEnrollment(enrollment: ProgramEnrollment): boolean {
  return enrollment.program.isAftercare;
}

export function enrollmentsOfKind(
  rows: readonly ProgramEnrollment[],
  kind: EnrollmentKind,
): ProgramEnrollment[] {
  return rows.filter((row) =>
    kind === "aftercare" ? isAftercareEnrollment(row) : !isAftercareEnrollment(row),
  );
}

export function findEnrollment(
  rows: readonly ProgramEnrollment[],
  id: string,
): ProgramEnrollment | undefined {
  return rows.find((row) => row.id === id);
}

/**
 * Enrollment `status` is a free string on the patient API, so unknown values
 * are labelled rather than hidden.
 */
const STATUS_CHIPS: Record<string, { label: string; tone: ChipTone }> = {
  ACTIVE: { label: "Active", tone: "positive" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  PAUSED: { label: "Paused", tone: "attention" },
  CANCELLED: { label: "Cancelled", tone: "critical" },
  CANCELED: { label: "Cancelled", tone: "critical" },
  ENDED: { label: "Ended", tone: "neutral" },
};

export function enrollmentStatusChip(status: string): { label: string; tone: ChipTone } {
  const key = status.trim().toUpperCase();
  const known = STATUS_CHIPS[key];
  if (known) return known;

  const label = status.trim().replace(/_/g, " ");
  if (label.length === 0) return { label: "Unknown", tone: "neutral" };
  return { label: label.charAt(0).toUpperCase() + label.slice(1).toLowerCase(), tone: "neutral" };
}

export function formatEnrollmentDate(value: Date | null): string | null {
  if (value === null || Number.isNaN(value.getTime())) return null;
  return value.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function enrollmentCaption(enrollment: ProgramEnrollment): string {
  const status = enrollmentStatusChip(enrollment.status).label;
  const started = formatEnrollmentDate(enrollment.startedAt);
  if (started) return `${status} · Started ${started}`;
  return status;
}

export type ProgramChecklistItem = {
  title: string;
  detail?: string;
};

/**
 * `TreatmentProgram.instructions` is untyped JSON. Missing or malformed
 * payloads are treated as "no checklist" rather than a crash.
 */
export function parseProgramChecklist(value: unknown): ProgramChecklistItem[] {
  if (typeof value !== "object" || value === null) return [];
  if (!("checklist" in value) || !Array.isArray(value.checklist)) return [];

  const items: ProgramChecklistItem[] = [];
  for (const row of value.checklist) {
    if (typeof row !== "object" || row === null) continue;
    if (!("title" in row) || typeof row.title !== "string") continue;
    const title = row.title.trim();
    if (title.length === 0) continue;
    const detail =
      "detail" in row && typeof row.detail === "string" && row.detail.trim().length > 0
        ? row.detail.trim()
        : undefined;
    items.push({ title, detail });
  }
  return items;
}
