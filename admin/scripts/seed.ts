/**
 * Local environment reset + seed.
 *
 * Wipes all application data, creates the fixed local admin, then seeds
 * locations, service categories, services, employees, products, and shipping.
 *
 * Prerequisites:
 * - NestJS API running on port 4000 (`cd nova_thera_backend_nest_app && pnpm start:dev`)
 * - DATABASE_URL in nova_thera_backend_nest_app/.env
 *
 * Usage (from nova_thera_admin_next_app):
 *   pnpm seed
 *
 * Fixed local admin (override with SEED_EMAIL / SEED_PASSWORD if needed):
 *   email:    localadmin@novathera.com
 *   password: admin@123
 *
 * Optional counts:
 *   SEED_LOCATIONS=2  SEED_SERVICES=5  SEED_EMPLOYEES=3  SEED_PRODUCTS=6
 */

import { TRPCClientError } from "@trpc/client";
import { config } from "dotenv";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { signIn, signUp } from "./lib/auth";
import {
  makeEmployeeInput,
  makeLocationInput,
  makeProductInput,
  makeServiceCategoryInput,
  makeServiceInput,
} from "./lib/faker-data";
import { createAuthenticatedTrpcClient } from "./lib/trpc";

// Override if your local clone of the backend uses a different folder name
// than the repo (Nova-Thera/nova_thera_backend_nest_app).
const NEST_APP_DIR_NAME =
  process.env.SEED_NEST_APP_DIR ?? "nova_thera_backend_nest_app";
const nestAppDir = resolve(process.cwd(), "..", NEST_APP_DIR_NAME);

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(nestAppDir, ".env") });

const LOCAL_ADMIN_EMAIL = "localadmin@novathera.com";
const LOCAL_ADMIN_PASSWORD = "admin@123";
const LOCAL_ADMIN_NAME = "Local Admin";

const locationCount = Number(process.env.SEED_LOCATIONS ?? 2);
const serviceCount = Number(process.env.SEED_SERVICES ?? 5);
const employeeCount = Number(process.env.SEED_EMPLOYEES ?? 3);
const productCount = Number(process.env.SEED_PRODUCTS ?? 6);

function assertLocalOnly() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to wipe/seed in production (NODE_ENV=production).");
    process.exit(1);
  }
}

function runNestScript(script: string, env: Record<string, string> = {}) {
  execFileSync("pnpm", ["run", script], {
    cwd: nestAppDir,
    stdio: "inherit",
    env: { ...process.env, ...env },
    shell: process.platform === "win32",
  });
}

async function bootstrapLocalAdmin(email: string, password: string) {
  console.log(`Creating local admin ${email}...`);
  await signUp(email, password, LOCAL_ADMIN_NAME);

  console.log("Promoting to admin + verifying email...");
  runNestScript("admin:create", { ADMIN_EMAIL: email });
}

async function main() {
  assertLocalOnly();

  const email = (process.env.SEED_EMAIL ?? LOCAL_ADMIN_EMAIL).toLowerCase();
  const password = process.env.SEED_PASSWORD ?? LOCAL_ADMIN_PASSWORD;

  console.log("Wiping database...");
  runNestScript("db:wipe");

  await bootstrapLocalAdmin(email, password);

  console.log("Signing in as admin...");
  const { fetch } = await signIn(email, password);
  const trpc = createAuthenticatedTrpcClient(fetch);

  console.log(`Creating ${locationCount} location(s)...`);
  const locationIds: string[] = [];
  for (let i = 0; i < locationCount; i++) {
    const location = await trpc.locations.create.mutate(makeLocationInput());
    locationIds.push(location.id);
    console.log(`  + ${location.name} (${location.id})`);
  }

  console.log("Creating service categories...");
  const categoryIds: string[] = [];
  const categoryNames = ["Massage Therapy", "Physiotherapy", "Aesthetics"];
  for (let i = 0; i < categoryNames.length; i++) {
    const category = await trpc.serviceCategories.create.mutate(
      makeServiceCategoryInput(i, categoryNames[i]),
    );
    categoryIds.push(category.id);
    console.log(`  + category: ${category.name}`);
  }

  console.log(`Creating ${employeeCount} employee(s)...`);
  const employeeIds: string[] = [];
  for (let i = 0; i < employeeCount; i++) {
    const locationId = locationIds[i % locationIds.length];
    const result = await trpc.employees.create.mutate(
      makeEmployeeInput(locationId),
    );
    employeeIds.push(result.employee.id);
    console.log(
      `  + ${result.employee.firstName} ${result.employee.lastName} (${result.employee.workEmail})`,
    );
  }

  console.log(`Creating ${serviceCount} service(s)...`);
  for (let i = 0; i < serviceCount; i++) {
    const categoryId = categoryIds[i % categoryIds.length];
    const staffIds =
      employeeIds.length > 0
        ? fakerPickSome(employeeIds, {
            min: 1,
            max: Math.min(3, employeeIds.length),
          })
        : [];

    const service = await trpc.services.create.mutate(
      makeServiceInput(categoryId, locationIds, staffIds),
    );
    console.log(`  + ${service.name} (${service.id})`);
  }

  // Two businesses sell through one storefront. Beauty is the platform brand:
  // it owns the Stripe account customers pay, so its share never moves.
  // Wellness is a Connect connected account paid by transfer per order.
  console.log("Creating brands...");
  const beauty = await trpc.brands.create.mutate({
    name: "Beauty",
    tagline: "Skincare and aesthetics",
    displayOrder: 0,
    active: true,
    isPlatform: true,
  });
  console.log(`  + ${beauty.name} (platform)`);

  const wellness = await trpc.brands.create.mutate({
    name: "Wellness",
    tagline: "Supplements and recovery",
    displayOrder: 1,
    active: true,
    isPlatform: false,
  });
  console.log(`  + ${wellness.name} (connected account pending)`);

  const brandIds = [beauty.id, wellness.id];

  console.log(`Creating ${productCount} product(s)...`);
  for (let i = 0; i < productCount; i++) {
    // Alternate so a mixed cart is possible straight after seeding.
    const brandId = brandIds[i % brandIds.length];
    const product = await trpc.products.create.mutate(
      makeProductInput(brandId),
    );
    console.log(`  + ${product.name} (${product.id})`);
  }

  console.log("Creating shipping tiers...");
  const shippingTiers = [
    {
      name: "Standard",
      rateCents: 999,
      freeOverCents: 7500,
      minDeliveryDays: 3,
      maxDeliveryDays: 7,
      active: true,
    },
    {
      name: "Express",
      rateCents: 1999,
      freeOverCents: null,
      minDeliveryDays: 1,
      maxDeliveryDays: 3,
      active: true,
    },
  ];
  for (const tier of shippingTiers) {
    const created = await trpc.shippingTiers.create.mutate(tier);
    console.log(`  + ${created.name} (${created.id})`);
  }

  // Everything above went through the API, so it all carries today's date.
  // This backfills months of activity directly in Postgres so the analytics
  // dashboard has a real trend to draw. Skip with SEED_HISTORY=false.
  if (process.env.SEED_HISTORY !== "false") {
    console.log("\nSeeding historical activity for analytics...");
    runNestScript("db:seed:history");
  }

  console.log("\nDone. Local admin credentials:");
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log("  login:    http://localhost:3001/login");
}

function fakerPickSome<T>(
  items: T[],
  range: { min: number; max: number },
): T[] {
  const count = Math.min(
    items.length,
    range.min + Math.floor(Math.random() * (range.max - range.min + 1)),
  );
  const copy = [...items];
  const picked: T[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    picked.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return picked;
}

main().catch((error: unknown) => {
  if (error instanceof TRPCClientError) {
    console.error(error.message);
    if (error.data?.zodError) {
      console.error(JSON.stringify(error.data.zodError, null, 2));
    }
  } else {
    console.error(error instanceof Error ? error.message : error);
  }
  process.exit(1);
});
