/**
 * Idempotent demo treatment programs for the Next.js patient API (`nova_thera_next`).
 *
 * Upserts programs by slug and enrolls every existing patient plus a well-known
 * demo patient (`+16045550100`) when encryption keys are available.
 *
 *   npx tsx prisma/seed-programs.ts
 *   npm run db:seed:programs
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";
import type { Prisma } from "@prisma/client";

const ENV_PATH = resolve(__dirname, "../.env");

type ChecklistItem = { title: string; detail: string };

type ProgramSpec = {
  slug: string;
  title: string;
  description: string;
  isAftercare: boolean;
  checklist: ChecklistItem[];
};

const PROGRAMS: ProgramSpec[] = [
  {
    slug: "weight-management",
    title: "Weight management",
    description:
      "A 12-week medically supervised plan covering nutrition, movement, and weekly check-ins.",
    isAftercare: false,
    checklist: [
      { title: "Log morning weight", detail: "Same scale, after using the bathroom, before breakfast." },
      { title: "Follow the meal outline", detail: "Protein at each meal; the clinic handout is the source of truth." },
      { title: "Walk 20 minutes", detail: "Most days. Pause if a clinician told you to rest." },
      { title: "Bring questions to your next visit", detail: "Write them down the night before." },
    ],
  },
  {
    slug: "sleep-recovery",
    title: "Sleep recovery",
    description: "Wind-down habits, light timing, and a short sleep log to review with your clinician.",
    isAftercare: false,
    checklist: [
      { title: "Same bedtime window", detail: "Aim for a 30-minute window, including weekends." },
      { title: "Screens off 45 minutes before bed", detail: "Charge the phone outside the bedroom if you can." },
      { title: "Log time to fall asleep", detail: "A rough estimate is enough; no clinical scores in the banner." },
      { title: "Limit late caffeine", detail: "None after mid-afternoon unless your clinician says otherwise." },
    ],
  },
  {
    slug: "metabolic-reset",
    title: "Metabolic reset",
    description: "Lab-informed nutrition and movement after an intake consult. Not a crash diet.",
    isAftercare: false,
    checklist: [
      { title: "Complete requested labs", detail: "Fasting if the requisition says so." },
      { title: "Take prescribed supplements with food", detail: "Skip a dose rather than doubling up." },
      { title: "Note energy after meals", detail: "A one-line note is enough for your next visit." },
    ],
  },
  {
    slug: "iv-therapy-aftercare",
    title: "IV therapy aftercare",
    description: "The 48 hours after an infusion: fluids, rest, and when to call the clinic.",
    isAftercare: true,
    checklist: [
      { title: "Drink water through the day", detail: "Unless you were given a fluid restriction." },
      { title: "Eat a regular meal", detail: "Protein and salt as tolerated; avoid skipping dinner." },
      { title: "Rest the remainder of the day", detail: "No intense training for 24 hours." },
      { title: "Call the clinic for fever or swelling at the site", detail: "Do not wait for the next booked visit." },
    ],
  },
  {
    slug: "acupuncture-aftercare",
    title: "Acupuncture aftercare",
    description: "Simple follow-up after needling: hydration, heat, and activity limits.",
    isAftercare: true,
    checklist: [
      { title: "Keep the area clean and dry", detail: "Avoid a hot tub or pool for the rest of the day." },
      { title: "Gentle movement only", detail: "Skip heavy lifting until tomorrow." },
      { title: "Note sleep and pain the next morning", detail: "Bring that note to your next session." },
    ],
  },
];

const DEMO_PHONE_E164 = "+16045550100";
const DEMO_DISPLAY_NAME = "Demo Patient";

function instructionsJson(checklist: ChecklistItem[]): Prisma.InputJsonValue {
  return { checklist };
}

async function main() {
  if (existsSync(ENV_PATH)) {
    loadEnvFile(ENV_PATH);
  }

  if (process.env.NODE_ENV === "production" || process.env.APP_ENV === "production") {
    console.error("Refusing to seed demo programs in production.");
    process.exit(1);
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    console.log("Seeding Next.js patient programs…");

    const programIds: string[] = [];
    for (const spec of PROGRAMS) {
      const data = {
        title: spec.title,
        description: spec.description,
        isAftercare: spec.isAftercare,
        active: true,
        instructions: instructionsJson(spec.checklist),
      };
      const program = await prisma.treatmentProgram.upsert({
        where: { slug: spec.slug },
        create: { slug: spec.slug, ...data },
        update: data,
      });
      programIds.push(program.id);
      console.log(`  program: ${program.title} (${program.slug})`);
    }

    let demoPatientId: string | null = null;
    try {
      const crypto = await import("../src/lib/crypto/secrets");
      const phoneLookupHash = crypto.hashPhone(DEMO_PHONE_E164);
      const existing = await prisma.patient.findUnique({ where: { phoneLookupHash } });
      const patient = existing
        ? await prisma.patient.update({
            where: { id: existing.id },
            data: { displayName: existing.displayName ?? DEMO_DISPLAY_NAME, deletedAt: null },
          })
        : await prisma.patient.create({
            data: {
              phoneLookupHash,
              phoneE164Encrypted: crypto.encryptString(DEMO_PHONE_E164),
              displayName: DEMO_DISPLAY_NAME,
              locale: "en",
              timezone: "America/Vancouver",
            },
          });
      demoPatientId = patient.id;
      console.log(`  demo patient: ${DEMO_PHONE_E164} (${patient.id})`);
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : "unknown";
      console.log(`  demo patient skipped (encryption/env): ${detail}`);
    }

    const patients = await prisma.patient.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });

    if (patients.length === 0) {
      console.log("  no patients to enroll");
      return;
    }

    let enrollments = 0;
    for (const patient of patients) {
      for (const programId of programIds) {
        await prisma.programEnrollment.upsert({
          where: {
            patientId_programId: { patientId: patient.id, programId },
          },
          create: {
            patientId: patient.id,
            programId,
            status: "ACTIVE",
            startedAt: new Date(),
          },
          update: { status: "ACTIVE", endedAt: null },
        });
        enrollments += 1;
      }
    }

    console.log(
      `  enrollments upserted: ${enrollments} across ${patients.length} patient(s)` +
        (demoPatientId ? ` including demo ${DEMO_PHONE_E164}` : ""),
    );
    console.log("Program seed complete.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Program seed failed:", error);
  process.exit(1);
});
