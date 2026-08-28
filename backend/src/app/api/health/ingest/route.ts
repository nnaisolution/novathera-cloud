import { z } from "zod";
import { OBSERVATION_SOURCES, OBSERVATION_TYPES } from "@novathera/shared";
import { json } from "@/lib/http/cors";
import { verifyAccessToken } from "@/lib/http/jwt";
import { ingestObservations } from "@/services/health/ingest";
import { logger } from "@/lib/logging/logger";

const bodySchema = z.object({
  observations: z
    .array(
      z.object({
        type: z.enum(OBSERVATION_TYPES),
        source: z.enum(OBSERVATION_SOURCES),
        effectiveAt: z.string(),
        valueQuantity: z.number().optional(),
        valueUnit: z.string().optional(),
        components: z
          .array(
            z.object({
              code: z.string(),
              valueQuantity: z.number(),
              unit: z.string(),
            }),
          )
          .optional(),
        sourceRecordId: z.string().optional(),
        status: z.enum(["PRELIMINARY", "FINAL", "ENTERED_IN_ERROR"]).optional(),
        contentHash: z.string().optional(),
        loincCode: z.string().optional(),
        fhirCategory: z.string().optional(),
        valueNormalized: z.number().optional(),
        unitNormalized: z.string().nullable().optional(),
      }),
    )
    .min(1)
    .max(200),
});

export async function OPTIONS(req: Request) {
  return json({}, { origin: req.headers.get("origin") });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const header = req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const patientId = token ? await verifyAccessToken(token) : null;
  if (!patientId) {
    return json({ error: "unauthorized" }, { status: 401, origin });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: "invalid_request" }, { status: 400, origin });
  }

  try {
    const result = await ingestObservations(patientId, parsed.data.observations);
    return json(result, { origin });
  } catch (error) {
    const consentMissing = error instanceof Error && error.message === "CONSENT_REQUIRED";
    logger.warn("health_ingest_failed");
    return json(
      { error: consentMissing ? "consent_required" : "ingest_failed" },
      { status: consentMissing ? 403 : 500, origin },
    );
  }
}
