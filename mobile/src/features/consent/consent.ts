import {
  CONSENT_PURPOSES,
  type ConsentPurpose,
  type DataCategory,
} from "../../shared";

export { CONSENT_PURPOSES, type ConsentPurpose };

/** Categories the grant mutation is allowed to send. Ingest keys off TREATMENT. */
export const TREATMENT_DATA_CATEGORIES: DataCategory[] = ["vitals"];

export type ConsentRecord = {
  id: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt: Date | null;
  revokedAt: Date | null;
  policyVersion: string;
  dataCategories: string[];
  updatedAt: Date;
};

export type PurposeCopy = {
  title: string;
  body: string;
};

export const PURPOSE_COPY: Record<ConsentPurpose, PurposeCopy> = {
  TREATMENT: {
    title: "Treatment",
    body: "Lets your care team use vitals you log here as part of your care. Readings cannot be saved without this.",
  },
  CARE_COORDINATION: {
    title: "Care coordination",
    body: "Share relevant details with other clinicians involved in your plan.",
  },
  ANALYTICS: {
    title: "Analytics",
    body: "Allow de-identified use to improve clinic operations and the app.",
  },
  RESEARCH: {
    title: "Research",
    body: "Allow use in research that Nova Thera has approved.",
  },
  THIRD_PARTY_SHARING: {
    title: "Third-party sharing",
    body: "Allow sharing with services outside Nova Thera that you connect later.",
  },
};

export function isConsentActive(record: ConsentRecord | undefined): boolean {
  return Boolean(record && record.granted && record.revokedAt === null);
}

/**
 * `consent.list` is newest-first. The first row per purpose is the current
 * decision; older grants and revokes stay in the list as history.
 */
export function latestByPurpose(rows: readonly ConsentRecord[]): Map<ConsentPurpose, ConsentRecord> {
  const latest = new Map<ConsentPurpose, ConsentRecord>();
  for (const row of rows) {
    if (!latest.has(row.purpose)) latest.set(row.purpose, row);
  }
  return latest;
}

export function isConsentRequiredError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const message = "message" in error ? error.message : undefined;
  return typeof message === "string" && message.includes("CONSENT_REQUIRED");
}
