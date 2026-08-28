import type { HealthObservationInput } from "@novathera/shared";
import { CANONICAL_UNITS, LOINC_CODES } from "@novathera/shared";
import { createHash } from "node:crypto";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logging/logger";

function contentHash(input: HealthObservationInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        type: input.type,
        effectiveAt: input.effectiveAt,
        valueQuantity: input.valueQuantity ?? null,
        valueUnit: input.valueUnit ?? null,
        components: input.components ?? null,
        source: input.source,
        sourceRecordId: input.sourceRecordId ?? null,
      }),
    )
    .digest("hex");
}

function normalize(type: HealthObservationInput["type"], value: number, unit?: string) {
  const canonical = CANONICAL_UNITS[type];
  const u = (unit ?? canonical ?? "").toLowerCase();
  if (type === "WEIGHT" && (u === "lb" || u === "lbs")) {
    return { valueNormalized: value * 0.45359237, unitNormalized: "kg" };
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

export async function ingestObservations(patientId: string, observations: HealthObservationInput[]) {
  const treatmentConsent = await prisma.consent.findFirst({
    where: { patientId, purpose: "TREATMENT", granted: true, revokedAt: null },
    orderBy: { grantedAt: "desc" },
  });
  if (!treatmentConsent) {
    throw new Error("CONSENT_REQUIRED");
  }

  let inserted = 0;
  let duplicates = 0;

  for (const observation of observations) {
    const hash = contentHash(observation);
    const existing = await prisma.healthObservation.findUnique({
      where: { patientId_contentHash: { patientId, contentHash: hash } },
    });
    if (existing) {
      duplicates += 1;
      continue;
    }
    const normalized =
      observation.valueQuantity !== undefined
        ? normalize(observation.type, observation.valueQuantity, observation.valueUnit)
        : { valueNormalized: undefined, unitNormalized: CANONICAL_UNITS[observation.type] };

    await prisma.healthObservation.create({
      data: {
        patientId,
        consentId: treatmentConsent.id,
        type: observation.type,
        loincCode: LOINC_CODES[observation.type],
        fhirCategory:
          observation.type === "PAIN" ? "survey" : observation.type === "STEPS" ? "activity" : "vital-signs",
        valueQuantity: observation.valueQuantity,
        valueUnit: observation.valueUnit,
        valueNormalized: normalized.valueNormalized,
        unitNormalized: normalized.unitNormalized,
        components: observation.components ?? undefined,
        effectiveAt: new Date(observation.effectiveAt),
        status: observation.status ?? "FINAL",
        source: observation.source,
        sourceRecordId: observation.sourceRecordId,
        contentHash: hash,
      },
    });
    inserted += 1;
  }

  await prisma.auditLog.create({
    data: {
      patientId,
      action: "health.ingest",
      resourceType: "HealthObservation",
    },
  });
  logger.info("health_ingest", { inserted, duplicates });
  return { inserted, duplicates };
}

export function toFhirObservationStub(id: string, type: string, valueNormalized?: number, unit?: string | null) {
  return {
    resourceType: "Observation",
    id,
    status: "final",
    code: { text: type },
    valueQuantity: valueNormalized !== undefined ? { value: valueNormalized, unit: unit ?? undefined } : undefined,
  };
}
