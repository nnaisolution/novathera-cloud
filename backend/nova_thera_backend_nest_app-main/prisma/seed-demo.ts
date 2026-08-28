/**
 * Idempotent demo catalog for the mobile booking wizard + membership screen.
 *
 * Upserts by stable slugs / names / emails so re-running is safe. Does not
 * wipe existing data. Membership plans are a code catalog (not Prisma rows);
 * this script only reports the STRIPE_PRICE_ID_* values already in .env.
 *
 *   pnpm db:seed:demo
 *   npx ts-node --transpile-only prisma/seed-demo.ts
 */
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client';

config({ path: resolve(__dirname, '../.env') });

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

const CLINIC_HOURS: Prisma.InputJsonValue = DAYS.map((day) => ({
  day,
  isOpen: day !== 'sunday',
  openTime: '09:00',
  closeTime: '17:00',
}));

const STAFF_SCHEDULE: Prisma.InputJsonValue = DAYS.map((day) => ({
  day,
  isWorking: day !== 'sunday',
  startTime: '09:00',
  endTime: '17:00',
}));

const LOCATIONS = [
  {
    slug: 'nova-thera-downtown',
    name: 'Nova Thera Downtown',
    addressLine1: '510 West Georgia Street',
    addressLine2: 'Suite 400',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6B 0M3',
    country: 'CA',
    phone: '+1 (604) 555-0101',
    email: 'downtown@novathera.demo',
    timezone: 'America/Vancouver',
  },
  {
    slug: 'nova-thera-westside',
    name: 'Nova Thera Westside',
    addressLine1: '2184 West 4th Avenue',
    city: 'Vancouver',
    province: 'BC',
    postalCode: 'V6K 1N6',
    country: 'CA',
    phone: '+1 (604) 555-0102',
    email: 'westside@novathera.demo',
    timezone: 'America/Vancouver',
  },
] as const;

const CATEGORIES = [
  { name: 'Naturopathic Consultation', displayOrder: 0 },
  { name: 'IV Therapy', displayOrder: 1 },
  { name: 'Acupuncture', displayOrder: 2 },
  { name: 'Massage Therapy', displayOrder: 3 },
  { name: 'Sleep & Recovery', displayOrder: 4 },
  { name: 'Weight Management', displayOrder: 5 },
] as const;

const SERVICES = [
  {
    slug: 'naturopathic-consultation',
    name: 'Naturopathic Consultation',
    categoryName: 'Naturopathic Consultation',
    shortDescription: 'Comprehensive intake covering history, labs, and a care plan.',
    detailedDescription:
      'A 60-minute visit with a naturopathic doctor to review health goals, recent labs, and next steps.',
    tags: ['consultation', 'intake'],
    durationMinutes: 60,
    standardPriceCents: 18900,
    memberPriceCents: 15900,
  },
  {
    slug: 'iv-therapy',
    name: 'IV Therapy',
    categoryName: 'IV Therapy',
    shortDescription: 'Customized nutrient infusion for recovery and energy.',
    detailedDescription:
      'A 45-minute Myers-style IV with practitioner supervision at the clinic.',
    tags: ['iv', 'recovery'],
    durationMinutes: 45,
    standardPriceCents: 22500,
    memberPriceCents: 18900,
  },
  {
    slug: 'acupuncture',
    name: 'Acupuncture',
    categoryName: 'Acupuncture',
    shortDescription: 'Traditional needling for pain, sleep, and stress.',
    detailedDescription:
      'A 45-minute acupuncture session with a registered acupuncturist.',
    tags: ['pain', 'stress'],
    durationMinutes: 45,
    standardPriceCents: 12500,
    memberPriceCents: 9900,
  },
  {
    slug: 'massage-therapy',
    name: 'Massage Therapy',
    categoryName: 'Massage Therapy',
    shortDescription: 'Registered massage for muscle tension and recovery.',
    detailedDescription:
      'A 60-minute registered massage therapy session tailored to your visit notes.',
    tags: ['massage', 'recovery'],
    durationMinutes: 60,
    standardPriceCents: 14500,
    memberPriceCents: 11900,
  },
  {
    slug: 'follow-up-consultation',
    name: 'Follow-up Consultation',
    categoryName: 'Naturopathic Consultation',
    shortDescription: 'Progress review and plan adjustment after your intake.',
    detailedDescription:
      'A 30-minute visit to review labs, symptoms, and next steps from your care plan.',
    tags: ['consultation', 'follow-up'],
    durationMinutes: 30,
    standardPriceCents: 9900,
    memberPriceCents: 7900,
  },
  {
    slug: 'sleep-recovery-consult',
    name: 'Sleep Recovery Consult',
    categoryName: 'Sleep & Recovery',
    shortDescription: 'Sleep history, wind-down habits, and a short follow-up plan.',
    detailedDescription:
      'A 45-minute visit focused on sleep timing, evening routines, and what to track before labs.',
    tags: ['sleep', 'recovery'],
    durationMinutes: 45,
    standardPriceCents: 16500,
    memberPriceCents: 13900,
  },
  {
    slug: 'weight-management-consult',
    name: 'Weight Management Consult',
    categoryName: 'Weight Management',
    shortDescription: 'Nutrition, movement, and weekly check-ins with a clinician.',
    detailedDescription:
      'A 50-minute visit to set realistic targets and the measurements your care team will review.',
    tags: ['weight', 'nutrition'],
    durationMinutes: 50,
    standardPriceCents: 17900,
    memberPriceCents: 14900,
  },
  {
    slug: 'lymphatic-drainage',
    name: 'Lymphatic Drainage',
    categoryName: 'Massage Therapy',
    shortDescription: 'Gentle lymphatic work after IV therapy or a procedure.',
    detailedDescription:
      'A 50-minute session with light pressure. Not a deep-tissue massage.',
    tags: ['massage', 'recovery'],
    durationMinutes: 50,
    standardPriceCents: 15500,
    memberPriceCents: 12900,
  },
] as const;

type LocationHome = 'downtown' | 'westside' | 'float';

const STAFF: Array<{
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  employeeCode: string;
  home: LocationHome;
  gender: 'FEMALE' | 'MALE';
}> = [
  {
    email: 'maya.chen@novathera.demo',
    firstName: 'Maya',
    lastName: 'Chen',
    jobTitle: 'Naturopathic Doctor',
    department: 'Clinical',
    employeeCode: 'NT-D001',
    home: 'downtown',
    gender: 'FEMALE',
  },
  {
    email: 'jordan.patel@novathera.demo',
    firstName: 'Jordan',
    lastName: 'Patel',
    jobTitle: 'Registered Acupuncturist',
    department: 'Wellness',
    employeeCode: 'NT-D002',
    home: 'westside',
    gender: 'MALE',
  },
  {
    email: 'aisha.rahman@novathera.demo',
    firstName: 'Aisha',
    lastName: 'Rahman',
    jobTitle: 'Registered Massage Therapist',
    department: 'Wellness',
    employeeCode: 'NT-D003',
    home: 'float',
    gender: 'FEMALE',
  },
  {
    email: 'noah.kim@novathera.demo',
    firstName: 'Noah',
    lastName: 'Kim',
    jobTitle: 'Naturopathic Doctor',
    department: 'Clinical',
    employeeCode: 'NT-D004',
    home: 'westside',
    gender: 'MALE',
  },
  {
    email: 'priya.sharma@novathera.demo',
    firstName: 'Priya',
    lastName: 'Sharma',
    jobTitle: 'Registered Dietitian',
    department: 'Clinical',
    employeeCode: 'NT-D005',
    home: 'downtown',
    gender: 'FEMALE',
  },
  {
    email: 'lucas.nguyen@novathera.demo',
    firstName: 'Lucas',
    lastName: 'Nguyen',
    jobTitle: 'IV Therapy Nurse',
    department: 'Clinical',
    employeeCode: 'NT-D006',
    home: 'float',
    gender: 'MALE',
  },
];

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in the Nest .env');
  }
  return databaseUrl;
}

function createPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: requireDatabaseUrl() });
  return new PrismaClient({ adapter });
}

async function upsertLocation(
  prisma: PrismaClient,
  spec: (typeof LOCATIONS)[number],
) {
  const existing = await prisma.location.findUnique({ where: { slug: spec.slug } });
  const data = {
    name: spec.name,
    addressLine1: spec.addressLine1,
    addressLine2: 'addressLine2' in spec ? spec.addressLine2 : null,
    city: spec.city,
    province: spec.province,
    postalCode: spec.postalCode,
    country: spec.country,
    phone: spec.phone,
    email: spec.email,
    timezone: spec.timezone,
    operatingHours: CLINIC_HOURS,
    status: 'OPEN' as const,
    deletedAt: null,
  };

  if (existing) {
    return prisma.location.update({ where: { id: existing.id }, data });
  }
  return prisma.location.create({ data: { ...data, slug: spec.slug } });
}

async function upsertCategory(
  prisma: PrismaClient,
  spec: (typeof CATEGORIES)[number],
) {
  const existing = await prisma.serviceCategory.findUnique({
    where: { name: spec.name },
  });
  const data = {
    displayOrder: spec.displayOrder,
    status: 'ACTIVE' as const,
    deletedAt: null,
  };
  if (existing) {
    return prisma.serviceCategory.update({ where: { id: existing.id }, data });
  }
  return prisma.serviceCategory.create({ data: { ...data, name: spec.name } });
}

async function upsertUser(
  prisma: PrismaClient,
  spec: (typeof STAFF)[number],
) {
  const email = spec.email.toLowerCase();
  const name = `${spec.firstName} ${spec.lastName}`;
  const existing = await prisma.user.findUnique({ where: { email } });
  const data = {
    name,
    firstName: spec.firstName,
    lastName: spec.lastName,
    emailVerified: true,
    role: 'staff',
    banned: false,
  };
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data });
  }
  return prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      ...data,
    },
  });
}

async function upsertEmployee(
  prisma: PrismaClient,
  spec: (typeof STAFF)[number],
  userId: string,
  locationId: string | null,
) {
  const byUser = await prisma.employee.findFirst({ where: { userId } });
  const byCode = await prisma.employee.findUnique({
    where: { employeeCode: spec.employeeCode },
  });
  const existing = byUser ?? byCode;
  const data = {
    userId,
    employeeCode: spec.employeeCode,
    firstName: spec.firstName,
    lastName: spec.lastName,
    jobTitle: spec.jobTitle,
    department: spec.department,
    employmentType: 'FULL_TIME' as const,
    startDate: new Date('2024-01-15T12:00:00.000Z'),
    locationId,
    schedule: STAFF_SCHEDULE,
    bufferMinutes: 10,
    status: 'ACTIVE' as const,
    gender: spec.gender,
    personalEmail: spec.email,
    deletedAt: null,
  };

  if (existing) {
    return prisma.employee.update({ where: { id: existing.id }, data });
  }
  return prisma.employee.create({ data });
}

async function upsertService(
  prisma: PrismaClient,
  spec: (typeof SERVICES)[number],
  categoryId: string,
  locationIds: string[],
  employeeIds: string[],
) {
  const existing = await prisma.service.findUnique({ where: { slug: spec.slug } });
  const data = {
    name: spec.name,
    categoryId,
    shortDescription: spec.shortDescription,
    detailedDescription: spec.detailedDescription,
    tags: [...spec.tags],
    status: 'ACTIVE' as const,
    durationMinutes: spec.durationMinutes,
    bufferAfterMinutes: 10,
    minAdvanceBookingMinutes: 0,
    maxAdvanceBookingDays: 60,
    requiresConsultation: false,
    standardPriceCents: spec.standardPriceCents,
    memberPriceCents: spec.memberPriceCents,
    currency: 'CAD',
    taxApplicable: true,
    depositRequired: false,
    anyAssignedStaff: true,
    clientCanChooseStaff: true,
    deletedAt: null,
    imageUrl: catalogImage('service', spec.slug),
  };

  const service = existing
    ? await prisma.service.update({ where: { id: existing.id }, data })
    : await prisma.service.create({ data: { ...data, slug: spec.slug } });

  for (const locationId of locationIds) {
    await prisma.serviceLocation.upsert({
      where: {
        serviceId_locationId: { serviceId: service.id, locationId },
      },
      create: { serviceId: service.id, locationId, isAvailable: true },
      update: { isAvailable: true },
    });
  }

  for (const employeeId of employeeIds) {
    await prisma.serviceEmployee.upsert({
      where: {
        serviceId_employeeId: { serviceId: service.id, employeeId },
      },
      create: { serviceId: service.id, employeeId },
      update: {},
    });
  }

  return service;
}

function reportMembershipCatalog() {
  const ids = {
    essential: process.env.STRIPE_PRICE_ID_ESSENTIAL?.trim() ?? '',
    enhanced: process.env.STRIPE_PRICE_ID_ENHANCED?.trim() ?? '',
    elite: process.env.STRIPE_PRICE_ID_ELITE?.trim() ?? '',
  };
  console.log('\nMembership (code catalog, not Prisma):');
  console.log('  Essential  $39.99  STRIPE_PRICE_ID_ESSENTIAL=' + (ids.essential || '(empty)'));
  console.log('  Enhanced   $59.99  STRIPE_PRICE_ID_ENHANCED=' + (ids.enhanced || '(empty)'));
  console.log('  Elite      $69.99  STRIPE_PRICE_ID_ELITE=' + (ids.elite || '(empty)'));
  console.log(
    '  myGetCurrent reads MEMBERSHIP_PLAN_CATALOG; Stripe plugin is skipped when keys are empty.',
  );
}

const PRODUCT_CATEGORIES = [
  { name: 'Supplements', slug: 'supplements', displayOrder: 0 },
  { name: 'Topicals', slug: 'topicals', displayOrder: 1 },
  { name: 'Recovery', slug: 'recovery', displayOrder: 2 },
] as const;

function catalogImage(kind: string, slug: string): string {
  return `https://picsum.photos/seed/nova-thera-${kind}-${slug}/640/640`;
}

const PRODUCTS = [
  {
    slug: 'magnesium-glycinate',
    name: 'Magnesium Glycinate',
    categorySlug: 'supplements',
    description: 'Evening mineral support for sleep and muscle recovery.',
    priceCents: 3499,
    quantity: 40,
  },
  {
    slug: 'vitamin-d3-k2',
    name: 'Vitamin D3 + K2',
    categorySlug: 'supplements',
    description: 'Daily D3 with K2 for bone and immune support.',
    priceCents: 2899,
    quantity: 55,
  },
  {
    slug: 'omega-3',
    name: 'Omega-3',
    categorySlug: 'supplements',
    description: 'Molecularly distilled fish oil, two capsules with food.',
    priceCents: 4299,
    quantity: 36,
  },
  {
    slug: 'recovery-balm',
    name: 'Recovery Balm',
    categorySlug: 'topicals',
    description: 'Arnica and magnesium cream for post-treatment soreness.',
    priceCents: 2499,
    quantity: 24,
  },
  {
    slug: 'electrolyte-mix',
    name: 'Electrolyte Mix',
    categorySlug: 'recovery',
    description: 'Unflavoured mineral mix for the 24 hours after IV therapy.',
    priceCents: 1899,
    quantity: 60,
  },
  {
    slug: 'sleep-support',
    name: 'Sleep Support',
    categorySlug: 'recovery',
    description: 'Magnesium, L-theanine, and glycine for wind-down.',
    priceCents: 3199,
    quantity: 28,
  },
  {
    slug: 'collagen-peptides',
    name: 'Collagen Peptides',
    categorySlug: 'supplements',
    description: 'Unflavoured peptides for skin, joints, and post-procedure recovery.',
    priceCents: 4599,
    quantity: 32,
  },
  {
    slug: 'probiotic-daily',
    name: 'Probiotic Daily',
    categorySlug: 'supplements',
    description: 'Refrigerated-stable 25 billion CFU, one capsule with breakfast.',
    priceCents: 3799,
    quantity: 44,
  },
  {
    slug: 'zinc-glycinate',
    name: 'Zinc Glycinate',
    categorySlug: 'supplements',
    description: 'Gentle zinc for immune support during metabolic programs.',
    priceCents: 2199,
    quantity: 50,
  },
  {
    slug: 'hydration-drops',
    name: 'Hydration Drops',
    categorySlug: 'recovery',
    description: 'Trace mineral drops for the day after IV therapy.',
    priceCents: 1699,
    quantity: 48,
  },
] as const;

async function upsertPlatformBrand(prisma: PrismaClient) {
  const existing =
    (await prisma.brand.findFirst({
      where: { isPlatform: true, deletedAt: null },
    })) ?? (await prisma.brand.findUnique({ where: { slug: 'nova-thera' } }));

  const data = {
    name: 'Nova Thera',
    tagline: 'Clinic shop',
    displayOrder: 0,
    active: true,
    isPlatform: true,
    deletedAt: null,
  };

  if (existing) {
    return prisma.brand.update({ where: { id: existing.id }, data });
  }
  return prisma.brand.create({ data: { ...data, slug: 'nova-thera' } });
}

async function upsertProductCategory(
  prisma: PrismaClient,
  spec: (typeof PRODUCT_CATEGORIES)[number],
) {
  const existing = await prisma.productCategory.findUnique({
    where: { slug: spec.slug },
  });
  const data = {
    name: spec.name,
    displayOrder: spec.displayOrder,
    deletedAt: null,
  };
  if (existing) {
    return prisma.productCategory.update({ where: { id: existing.id }, data });
  }
  return prisma.productCategory.create({ data: { ...data, slug: spec.slug } });
}

async function upsertProduct(
  prisma: PrismaClient,
  spec: (typeof PRODUCTS)[number],
  brandId: string,
  categoryId: string,
) {
  const existing = await prisma.product.findUnique({ where: { slug: spec.slug } });
  const data = {
    name: spec.name,
    description: spec.description,
    status: 'ACTIVE' as const,
    priceCents: spec.priceCents,
    currency: 'CAD',
    categoryId,
    brandId,
    deletedAt: null,
  };

  const product = existing
    ? await prisma.product.update({ where: { id: existing.id }, data })
    : await prisma.product.create({ data: { ...data, slug: spec.slug } });

  const imageUrl = catalogImage('product', spec.slug);
  const imageAlt = spec.name;
  const images = await prisma.productImage.findMany({
    where: { productId: product.id },
    orderBy: { sortOrder: 'asc' },
  });
  const canonical = images.find((image) => image.url === imageUrl);
  if (!canonical) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: imageAlt,
        sortOrder: 0,
      },
    });
  } else if (canonical.alt !== imageAlt) {
    await prisma.productImage.update({
      where: { id: canonical.id },
      data: { alt: imageAlt },
    });
  }

  await prisma.inventoryLevel.upsert({
    where: { productId: product.id },
    create: {
      productId: product.id,
      quantity: spec.quantity,
      lowStockThreshold: 5,
      allowBackorder: false,
    },
    update: { quantity: spec.quantity, allowBackorder: false },
  });

  return product;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed demo data in production.');
    process.exit(1);
  }

  const prisma = createPrisma();
  try {
    console.log('Seeding Nova Thera demo catalog…');

    const downtown = await upsertLocation(prisma, LOCATIONS[0]);
    const westside = await upsertLocation(prisma, LOCATIONS[1]);
    console.log(`  locations: ${downtown.name}, ${westside.name}`);

    const categoryByName = new Map<string, string>();
    for (const spec of CATEGORIES) {
      const category = await upsertCategory(prisma, spec);
      categoryByName.set(spec.name, category.id);
      console.log(`  category: ${category.name}`);
    }

    const employees = [];
    for (const spec of STAFF) {
      const user = await upsertUser(prisma, spec);
      const locationId =
        spec.home === 'downtown'
          ? downtown.id
          : spec.home === 'westside'
            ? westside.id
            : null;
      const employee = await upsertEmployee(prisma, spec, user.id, locationId);
      employees.push(employee);
      console.log(
        `  staff: ${employee.firstName} ${employee.lastName} (${employee.jobTitle}) @ ${spec.home}`,
      );
    }

    const locationIds = [downtown.id, westside.id];
    const employeeIds = employees.map((e) => e.id);
    for (const spec of SERVICES) {
      const categoryId = categoryByName.get(spec.categoryName);
      if (!categoryId) {
        throw new Error(`Missing category ${spec.categoryName}`);
      }
      const service = await upsertService(
        prisma,
        spec,
        categoryId,
        locationIds,
        employeeIds,
      );
      console.log(`  service: ${service.name} (${service.durationMinutes} min)`);
    }

    const brand = await upsertPlatformBrand(prisma);
    console.log(`  brand: ${brand.name} (${brand.slug})`);

    const productCategoryBySlug = new Map<string, string>();
    for (const spec of PRODUCT_CATEGORIES) {
      const category = await upsertProductCategory(prisma, spec);
      productCategoryBySlug.set(spec.slug, category.id);
      console.log(`  product category: ${category.name}`);
    }

    for (const spec of PRODUCTS) {
      const categoryId = productCategoryBySlug.get(spec.categorySlug);
      if (!categoryId) {
        throw new Error(`Missing product category ${spec.categorySlug}`);
      }
      const product = await upsertProduct(prisma, spec, brand.id, categoryId);
      console.log(`  product: ${product.name} $${(product.priceCents / 100).toFixed(2)}`);
    }

    reportMembershipCatalog();
    console.log('\nDemo seed complete. Availability is derived from weekly hours (Mon–Sat 09:00–17:00), not stored Slot rows.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Demo seed failed:', error);
  process.exit(1);
});
