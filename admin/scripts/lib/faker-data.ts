import { faker } from '@faker-js/faker'

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const CANADIAN_PROVINCES = ['AB', 'BC', 'ON', 'QC', 'MB', 'SK', 'NS', 'NB'] as const

const DEPARTMENTS = [
  'Clinical',
  'Wellness',
  'Aesthetics',
  'Physiotherapy',
  'Massage Therapy',
] as const

const JOB_TITLES = [
  'Registered Massage Therapist',
  'Physiotherapist',
  'Esthetician',
  'Wellness Coordinator',
  'Clinical Assistant',
] as const

const SERVICE_NAMES = [
  'Deep Tissue Massage',
  'Swedish Massage',
  'Sports Recovery Session',
  'Hydrafacial',
  'Physiotherapy Assessment',
  'Cupping Therapy',
  'Hot Stone Massage',
  'Laser Skin Treatment',
] as const

const CATEGORY_NAMES = [
  'Massage Therapy',
  'Physiotherapy',
  'Aesthetics',
  'Wellness',
] as const

export function makeOperatingHours() {
  return DAYS.map((day) => ({
    day,
    isOpen: day !== 'sunday',
    openTime: '09:00',
    closeTime: '17:00',
  }))
}

export function makeEmployeeSchedule() {
  return DAYS.map((day) => ({
    day,
    isWorking: day !== 'sunday',
    startTime: '09:00',
    endTime: '17:00',
  }))
}

function canadianPostalCode() {
  const letters = 'ABCEGHJKLMNPRSTVXY'
  const l = () => letters[faker.number.int({ min: 0, max: letters.length - 1 })]
  const d = () => faker.number.int({ min: 0, max: 9 })
  return `${l()}${d()}${l()} ${d()}${l()}${d()}`
}

function phone() {
  const area = `${faker.number.int({ min: 2, max: 9 })}${faker.string.numeric(2)}`
  const exchange = `${faker.number.int({ min: 2, max: 9 })}${faker.string.numeric(2)}`
  const line = faker.string.numeric(4)
  return `+1 (${area}) ${exchange}-${line}`
}

export function makeLocationInput() {
  const city = faker.location.city()
  return {
    name: `${faker.company.name()} Clinic`,
    addressLine1: faker.location.streetAddress(),
    addressLine2: faker.helpers.maybe(() => faker.location.secondaryAddress(), {
      probability: 0.3,
    }),
    city,
    province: faker.helpers.arrayElement(CANADIAN_PROVINCES),
    postalCode: canadianPostalCode(),
    country: 'CA' as const,
    phone: phone(),
    email: faker.internet.email({ provider: 'novathera.test' }).toLowerCase(),
    timezone: 'America/Edmonton',
    operatingHours: makeOperatingHours(),
    status: 'OPEN' as const,
  }
}

export function makeServiceCategoryInput(displayOrder: number, name?: string) {
  return {
    name: name ?? faker.helpers.arrayElement(CATEGORY_NAMES),
    displayOrder,
    status: 'ACTIVE' as const,
  }
}

export function makeServiceInput(
  categoryId: string,
  locationIds: string[],
  staffEmployeeIds: string[],
) {
  const standardPriceCents = faker.number.int({ min: 5000, max: 25000 })
  const memberPriceCents = faker.number.int({
    min: 4000,
    max: standardPriceCents,
  })

  return {
    name: `${faker.helpers.arrayElement(SERVICE_NAMES)} ${faker.string.alphanumeric(4)}`,
    categoryId,
    shortDescription: faker.lorem.sentence(),
    detailedDescription: faker.lorem.paragraph(),
    tags: faker.helpers.arrayElements(['relaxation', 'recovery', 'skin', 'pain'], {
      min: 1,
      max: 3,
    }),
    status: 'ACTIVE' as const,
    durationMinutes: faker.helpers.arrayElement([30, 45, 60, 90]),
    bufferAfterMinutes: faker.helpers.arrayElement([0, 5, 10, 15]),
    minAdvanceBookingMinutes: 60,
    maxAdvanceBookingDays: 60,
    requiresConsultation: faker.datatype.boolean({ probability: 0.2 }),
    standardPriceCents,
    memberPriceCents,
    currency: 'CAD' as const,
    taxApplicable: true,
    depositRequired: false,
    anyAssignedStaff: staffEmployeeIds.length === 0,
    clientCanChooseStaff: true,
    locations: locationIds.map((locationId) => ({
      locationId,
      isAvailable: true,
    })),
    staffEmployeeIds,
  }
}

const PRODUCT_NAMES = [
  'Calming Peptide Serum',
  'Barrier Repair Cream',
  'Vitamin C Brightening Oil',
  'Hydrating Mist Toner',
  'Gentle Enzyme Cleanser',
  'Night Recovery Balm',
  'SPF 40 Daily Shield',
  'Soothing Eye Gel',
] as const

export function makeProductInput(brandId: string) {
  const name = `${faker.helpers.arrayElement(PRODUCT_NAMES)} ${faker.string.alphanumeric(4)}`
  return {
    name,
    brandId,
    description: faker.lorem.paragraph(),
    ingredients: faker.lorem.sentences(2),
    howToUse: faker.lorem.sentences(2),
    status: 'ACTIVE' as const,
    priceCents: faker.number.int({ min: 2500, max: 12000 }),
    currency: 'CAD' as const,
    concerns: faker.helpers.arrayElements(
      ['dryness', 'redness', 'aging', 'acne'],
      { min: 1, max: 3 },
    ),
    productTypes: faker.helpers.arrayElements(
      ['serum', 'cream', 'cleanser', 'treatment'],
      { min: 1, max: 2 },
    ),
    ingredientsFacet: faker.helpers.arrayElements(
      ['peptides', 'niacinamide', 'ceramides', 'vitamin-c'],
      { min: 1, max: 2 },
    ),
    skinTypes: faker.helpers.arrayElements(
      ['dry', 'oily', 'combination', 'sensitive'],
      { min: 1, max: 2 },
    ),
    images: [
      {
        url: `https://loremflickr.com/800/800/skincare,cosmetics?lock=${faker.number.int({ min: 1, max: 100000 })}`,
        alt: name,
        sortOrder: 0,
      },
    ],
    inventoryQuantity: faker.number.int({ min: 10, max: 80 }),
    lowStockThreshold: 5,
    allowBackorder: false,
  }
}

export function makeEmployeeInput(locationId: string) {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const unique = faker.string.alphanumeric(6).toLowerCase()

  return {
    firstName,
    lastName,
    dateOfBirth: faker.date.birthdate({ min: 22, max: 55, mode: 'age' }),
    gender: faker.helpers.arrayElement([
      'MALE',
      'FEMALE',
      'OTHER',
      'PREFER_NOT_TO_SAY',
    ] as const),
    personalPhone: phone(),
    personalEmail: faker.internet
      .email({ firstName, lastName, provider: 'personal.test' })
      .toLowerCase(),
    emergencyContactName: faker.person.fullName(),
    emergencyContactPhone: phone(),
    jobTitle: faker.helpers.arrayElement(JOB_TITLES),
    department: faker.helpers.arrayElement(DEPARTMENTS),
    employmentType: faker.helpers.arrayElement([
      'FULL_TIME',
      'PART_TIME',
      'CONTRACT',
    ] as const),
    startDate: faker.date.past({ years: 3 }),
    locationId,
    workEmail: `${firstName}.${lastName}.${unique}@staff.novathera.test`.toLowerCase(),
    role: 'staff' as const,
    schedule: makeEmployeeSchedule(),
    bufferMinutes: faker.helpers.arrayElement([0, 5, 10, 15]),
    maxDailyAppointments: faker.number.int({ min: 4, max: 12 }),
    certifications: [
      ...(faker.helpers.maybe(
        () => [
          {
            name: 'Professional License',
            qualification: faker.helpers.arrayElement(JOB_TITLES) as string,
            licenseNumber: faker.string.alphanumeric(8).toUpperCase(),
          },
        ],
        { probability: 0.6 },
      ) ?? []),
    ],
  }
}
