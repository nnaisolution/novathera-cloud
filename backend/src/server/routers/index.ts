import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { CURRENT_CONSENT_POLICY_VERSION, DATA_CATEGORIES, CONSENT_PURPOSES } from "@novathera/shared";
import { protectedProcedure, publicProcedure, staffProcedure, router } from "../trpc";
import { isOtpSmsBypassed, requestOtp, verifyOtp } from "../../services/auth/otp";
import { ingestObservations } from "../../services/health/ingest";
import { OBSERVATION_SOURCES, OBSERVATION_TYPES } from "@novathera/shared";
import type { HealthObservationInput } from "@novathera/shared";

const observationInput = z.object({
  type: z.enum(OBSERVATION_TYPES),
  source: z.enum(OBSERVATION_SOURCES),
  effectiveAt: z.string().datetime(),
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
});

async function ingestWithConsent(patientId: string, observations: HealthObservationInput[]) {
  try {
    return await ingestObservations(patientId, observations);
  } catch (error) {
    if (error instanceof Error && error.message === "CONSENT_REQUIRED") {
      throw new TRPCError({ code: "FORBIDDEN", message: "CONSENT_REQUIRED" });
    }
    throw error;
  }
}

export const appRouter = router({
  health: router({
    ping: publicProcedure.query(() => ({ ok: true as const })),
    ingest: protectedProcedure
      .input(z.object({ observations: z.array(observationInput).min(1).max(100) }))
      .mutation(({ ctx, input }) => ingestWithConsent(ctx.patientId, input.observations)),
    list: protectedProcedure
      .input(
        z.object({
          type: z.enum(OBSERVATION_TYPES).optional(),
          limit: z.number().int().min(1).max(100).default(50),
        }),
      )
      .query(({ ctx, input }) =>
        ctx.prisma.healthObservation.findMany({
          where: { patientId: ctx.patientId, type: input.type, status: "FINAL" },
          orderBy: { effectiveAt: "desc" },
          take: input.limit,
          select: {
            id: true,
            type: true,
            valueNormalized: true,
            unitNormalized: true,
            effectiveAt: true,
            source: true,
          },
        }),
      ),
    /**
     * Cross-patient list for admin/staff. Observations have no locationId —
     * they live on the patient record in this database, not Nest.
     */
    staffList: staffProcedure
      .input(
        z.object({
          type: z.enum(OBSERVATION_TYPES).optional(),
          search: z.string().max(80).optional(),
          limit: z.number().int().min(1).max(100).default(50),
          cursor: z.string().min(1).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const search = input.search?.trim();
        const items = await ctx.prisma.healthObservation.findMany({
          where: {
            status: "FINAL",
            type: input.type,
            ...(search
              ? {
                  patient: {
                    displayName: { contains: search, mode: "insensitive" },
                  },
                }
              : {}),
          },
          orderBy: [{ effectiveAt: "desc" }, { id: "desc" }],
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          select: {
            id: true,
            patientId: true,
            type: true,
            valueNormalized: true,
            unitNormalized: true,
            components: true,
            effectiveAt: true,
            source: true,
            patient: { select: { id: true, displayName: true } },
          },
        });
        const hasMore = items.length > input.limit;
        const page = hasMore ? items.slice(0, input.limit) : items;
        return {
          items: page,
          nextCursor: hasMore ? page[page.length - 1]?.id : undefined,
        };
      }),
  }),
  auth: router({
    requestOtp: publicProcedure
      .input(z.object({ phoneE164: z.string() }))
      .mutation(({ input }) => {
        if (isOtpSmsBypassed()) {
          console.info(
            "[otp-dev-bypass] auth.requestOtp skipping SMS (OTP_DEV_BYPASS or NODE_ENV!==production)",
          );
        }
        return requestOtp(input.phoneE164);
      }),
    verifyOtp: publicProcedure
      .input(z.object({ challengeId: z.string(), code: z.string().length(6) }))
      .mutation(({ input }) => verifyOtp(input.challengeId, input.code)),
  }),
  patient: router({
    me: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.patient.findUnique({
        where: { id: ctx.patientId },
        select: { id: true, displayName: true, locale: true, timezone: true, createdAt: true },
      }),
    ),
    updateProfile: protectedProcedure
      .input(
        z.object({
          displayName: z.string().min(1).max(80).optional(),
          locale: z.string().min(2).max(10).optional(),
          timezone: z.string().max(64).optional(),
        }),
      )
      .mutation(({ ctx, input }) =>
        ctx.prisma.patient.update({
          where: { id: ctx.patientId },
          data: input,
          select: { id: true, displayName: true, locale: true, timezone: true },
        }),
      ),
  }),
  consent: router({
    list: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.consent.findMany({
        where: { patientId: ctx.patientId },
        orderBy: { updatedAt: "desc" },
      }),
    ),
    set: protectedProcedure
      .input(
        z.object({
          purpose: z.enum(CONSENT_PURPOSES),
          granted: z.boolean(),
          dataCategories: z.array(z.enum(DATA_CATEGORIES)).default(["vitals"]),
        }),
      )
      .mutation(({ ctx, input }) =>
        ctx.prisma.consent.create({
          data: {
            patientId: ctx.patientId,
            purpose: input.purpose,
            granted: input.granted,
            grantedAt: input.granted ? new Date() : null,
            revokedAt: input.granted ? null : new Date(),
            dataCategories: input.dataCategories,
            policyVersion: CURRENT_CONSENT_POLICY_VERSION,
          },
        }),
      ),
  }),
  appointments: router({
    list: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.appointment.findMany({
        where: { patientId: ctx.patientId },
        orderBy: { startsAt: "asc" },
      }),
    ),
  }),
  membership: router({
    current: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.membership.findFirst({
        where: { patientId: ctx.patientId },
        orderBy: { updatedAt: "desc" },
      }),
    ),
  }),
  programs: router({
    list: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.programEnrollment.findMany({
        where: { patientId: ctx.patientId },
        include: { program: true },
      }),
    ),
  }),
  notifications: router({
    registerDevice: protectedProcedure
      .input(z.object({ platform: z.enum(["APNS", "FCM"]), tokenHash: z.string().min(32) }))
      .mutation(({ ctx, input }) =>
        ctx.prisma.deviceToken.upsert({
          where: { tokenHash: input.tokenHash },
          create: { patientId: ctx.patientId, platform: input.platform, tokenHash: input.tokenHash },
          update: { patientId: ctx.patientId, lastSeenAt: new Date(), revokedAt: null },
        }),
      ),
  }),
  crm: router({
    status: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.crmLink.findMany({
        where: { patientId: ctx.patientId },
        select: { provider: true, createdAt: true },
      }),
    ),
  }),
});

export type AppRouter = typeof appRouter;
