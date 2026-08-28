import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';

/**
 * Backdated activity for the analytics dashboard.
 *
 * The regular seed (`pnpm db:seed`) creates its data through the tRPC API,
 * which stamps `createdAt = now()` — so it can only ever produce a single
 * day of history and every chart comes out as one spike. This script writes
 * straight to Postgres instead, which is the only way to place records in the
 * past.
 *
 * Run it *after* the regular seed, which supplies the locations, services,
 * employees and products this builds on top of.
 *
 * Usage (from nova_thera_backend_nest_app):
 *   pnpm db:seed:history
 *   pnpm db:seed:history --reset    # replace previously generated history
 *
 * Without --reset the script only ever adds, so running it twice doubles the
 * data. --reset first removes what a previous run created (see clearHistory)
 * and leaves everything the regular seed owns untouched.
 *
 * Optional:
 *   HISTORY_DAYS=120       how far back to generate
 *   HISTORY_CUSTOMERS=40   customer accounts to create
 *   HISTORY_SEED=42        PRNG seed; same value produces the same data
 */

const DAYS = Number(process.env.HISTORY_DAYS ?? 120);
const CUSTOMER_COUNT = Number(process.env.HISTORY_CUSTOMERS ?? 40);
const PRNG_SEED = Number(process.env.HISTORY_SEED ?? 42);
const RESET = process.argv.includes('--reset');

/** Marks the customers this script owns, so --reset can find them again. */
const GENERATED_EMAIL_DOMAIN = '@example.com';

/**
 * Bookings are placed between 15:00 and 23:00 UTC, which is roughly 9am–5pm in
 * America/Edmonton year round. Staying inside a single UTC day keeps every
 * appointment in the same clinic-local day bucket without needing DST maths.
 */
const DAY_START_UTC_HOUR = 15;
const DAY_END_UTC_HOUR = 23;

const MEMBERSHIP_PLANS = [
  { name: 'Essential', weight: 5 },
  { name: 'Enhanced', weight: 3 },
  { name: 'Elite', weight: 2 },
];

const FIRST_NAMES = [
  'Aisha', 'Liam', 'Priya', 'Noah', 'Mei', 'Ethan', 'Fatima', 'Lucas',
  'Sofia', 'Arjun', 'Chloe', 'Mateo', 'Hana', 'Owen', 'Zara', 'Elias',
  'Nina', 'Rohan', 'Clara', 'Jonas', 'Amara', 'Felix', 'Leila', 'Theo',
];
const LAST_NAMES = [
  'Okafor', 'Tremblay', 'Sharma', 'Chen', 'Nguyen', 'Silva', 'Kaur', 'Muller',
  'Rossi', 'Haddad', 'Novak', 'Bergeron', 'Lindqvist', 'Osei', 'Marchand',
];
const CITIES = [
  ['Edmonton', 'AB', 'T5J 0N3'],
  ['Calgary', 'AB', 'T2P 1J9'],
  ['Sherwood Park', 'AB', 'T8A 3H9'],
  ['St. Albert', 'AB', 'T8N 5A5'],
];

// ------------------------------------------------------------------ utilities

/** Deterministic PRNG so a given HISTORY_SEED always yields the same dataset. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(PRNG_SEED);

const randInt = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

const pick = <T>(items: T[]): T => items[Math.floor(rand() * items.length)];

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rand() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

/** Prisma stores DateTime as `timestamp(3)` without a zone, holding UTC. */
function sqlTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/** cuid-shaped id; good enough for local fixtures. */
function makeId(): string {
  return `c${Date.now().toString(36)}${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function getPoolConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) throw new Error('DATABASE_URL is not set');
  // Prisma adds ?schema=public — node-pg does not accept that query param.
  return databaseUrl.replace(/\?.*$/, '');
}

/** Chunked multi-row INSERT; keeps parameter counts under Postgres' limit. */
async function insertRows(
  client: PoolClient,
  table: string,
  columns: string[],
  rows: unknown[][],
) {
  if (rows.length === 0) return;

  const chunkSize = Math.max(1, Math.floor(60000 / columns.length));
  const columnList = columns.map((column) => `"${column}"`).join(', ');

  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const values: unknown[] = [];
    const tuples = chunk.map((row) => {
      const placeholders = row.map((value) => {
        values.push(value);
        return `$${values.length}`;
      });
      return `(${placeholders.join(', ')})`;
    });

    await client.query(
      `INSERT INTO "${table}" (${columnList}) VALUES ${tuples.join(', ')}`,
      values,
    );
  }
}

// ------------------------------------------------------------- reference data

type Service = {
  id: string;
  durationMinutes: number;
  bufferAfterMinutes: number;
  standardPriceCents: number;
  memberPriceCents: number | null;
};

type Employee = { id: string; locationId: string | null };

async function loadReferenceData(client: PoolClient) {
  const [locations, employees, services, serviceEmployees, products] =
    await Promise.all([
      client.query<{ id: string }>(
        `SELECT id FROM "location" WHERE "deletedAt" IS NULL`,
      ),
      client.query<Employee>(
        `SELECT id, "locationId" FROM "employee" WHERE "deletedAt" IS NULL AND status = 'ACTIVE'`,
      ),
      client.query<Service>(
        `SELECT id, "durationMinutes", "bufferAfterMinutes", "standardPriceCents", "memberPriceCents"
         FROM "service" WHERE "deletedAt" IS NULL`,
      ),
      client.query<{ serviceId: string; employeeId: string }>(
        `SELECT "serviceId", "employeeId" FROM "service_employee"`,
      ),
      client.query<{ id: string; name: string; slug: string; priceCents: number }>(
        `SELECT id, name, slug, "priceCents" FROM "product" WHERE "deletedAt" IS NULL`,
      ),
    ]);

  return {
    locations: locations.rows,
    employees: employees.rows,
    services: services.rows,
    serviceEmployees: serviceEmployees.rows,
    products: products.rows,
  };
}

// ------------------------------------------------------------------ generators

function buildCustomers() {
  const rows: unknown[][] = [];
  const ids: { id: string; createdAt: Date }[] = [];

  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const id = randomUUID();
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const [city, province, postalCode] = pick(CITIES);
    // Spread signups over a window wider than the booking history so the
    // "new customers" delta has something to compare against.
    const createdAt = daysAgo(randInt(0, Math.round(DAYS * 1.5)));

    ids.push({ id, createdAt });
    rows.push([
      id,
      `${firstName} ${lastName}`,
      `${firstName}.${lastName}${i}@example.com`.toLowerCase(),
      true,
      sqlTimestamp(createdAt),
      sqlTimestamp(createdAt),
      'customer',
      firstName,
      lastName,
      `+1780555${String(1000 + i).slice(-4)}`,
      rand() < 0.6,
      city,
      province,
      postalCode,
      'CA',
    ]);
  }

  return { rows, ids };
}

/**
 * Bookings, laid out per employee per day so the `booking_no_overlap`
 * exclusion constraint can never fire: each employee's day is filled
 * sequentially from the opening hour, advancing by duration + buffer.
 */
function buildBookings(
  reference: Awaited<ReturnType<typeof loadReferenceData>>,
  customers: { id: string; createdAt: Date }[],
  startingCode: number,
) {
  const rows: unknown[][] = [];
  const servicesByEmployee = new Map<string, Service[]>();

  for (const link of reference.serviceEmployees) {
    const service = reference.services.find((s) => s.id === link.serviceId);
    if (!service) continue;
    const list = servicesByEmployee.get(link.employeeId) ?? [];
    list.push(service);
    servicesByEmployee.set(link.employeeId, list);
  }

  let code = startingCode;
  const now = Date.now();

  // Generate a few days into the future too, so "upcoming appointments" and
  // tomorrow's load are not empty.
  for (let dayOffset = DAYS; dayOffset >= -3; dayOffset--) {
    const day = daysAgo(dayOffset);
    const weekday = day.getUTCDay();

    // Older days get fewer bookings so the trend line slopes upward.
    const growth = 0.55 + (1 - dayOffset / DAYS) * 0.75;
    // Open seven days, but weekends run lighter than weekdays.
    const weekendFactor = weekday === 0 ? 0.45 : weekday === 6 ? 0.6 : 1;

    for (const employee of reference.employees) {
      const bookable = servicesByEmployee.get(employee.id) ?? reference.services;
      if (bookable.length === 0) continue;

      const target = Math.max(
        1,
        Math.round(randInt(2, 6) * growth * weekendFactor),
      );
      let cursorHour = DAY_START_UTC_HOUR;
      let cursorMinute = 0;

      for (let n = 0; n < target; n++) {
        const service = pick(bookable);
        const span = service.durationMinutes + service.bufferAfterMinutes;

        const startTime = new Date(
          Date.UTC(
            day.getUTCFullYear(),
            day.getUTCMonth(),
            day.getUTCDate(),
            cursorHour,
            cursorMinute,
          ),
        );
        const endTime = new Date(
          startTime.getTime() + service.durationMinutes * 60 * 1000,
        );

        // Stop once the day is full rather than spilling past closing.
        if (endTime.getUTCHours() >= DAY_END_UTC_HOUR) break;

        const isPast = endTime.getTime() < now;
        const roll = rand();
        let status: string;
        let cancelledAt: string | null = null;

        if (!isPast) {
          status = 'CONFIRMED';
        } else if (roll < 0.82) {
          status = 'COMPLETED';
        } else if (roll < 0.92) {
          status = 'CANCELLED';
          cancelledAt = sqlTimestamp(
            new Date(startTime.getTime() - randInt(1, 72) * 3600 * 1000),
          );
        } else {
          status = 'NO_SHOW';
        }

        const isMember = rand() < 0.3 && service.memberPriceCents !== null;
        const priceCents = isMember
          ? (service.memberPriceCents as number)
          : service.standardPriceCents;

        // Cancelled appointments are the ones most likely to be unpaid.
        const paymentStatus =
          status === 'CANCELLED'
            ? rand() < 0.5
              ? 'REFUNDED'
              : 'NONE'
            : rand() < 0.93
              ? 'PAID'
              : 'PENDING';

        const customer = pick(customers);
        // Booked somewhere between a week and an hour before the slot.
        const createdAt = new Date(
          Math.max(
            customer.createdAt.getTime(),
            startTime.getTime() - randInt(1, 168) * 3600 * 1000,
          ),
        );

        rows.push([
          makeId(),
          `BK-${String(code++).padStart(4, '0')}`,
          customer.id,
          employee.id,
          service.id,
          employee.locationId ?? pick(reference.locations).id,
          sqlTimestamp(startTime),
          sqlTimestamp(endTime),
          service.durationMinutes,
          status,
          paymentStatus,
          priceCents,
          'CAD',
          cancelledAt,
          sqlTimestamp(createdAt),
          sqlTimestamp(createdAt),
        ]);

        cursorMinute += span;
        cursorHour += Math.floor(cursorMinute / 60);
        cursorMinute %= 60;
        if (cursorHour >= DAY_END_UTC_HOUR) break;
      }
    }
  }

  return { rows, nextCode: code };
}

function buildOrders(
  products: { id: string; name: string; slug: string; priceCents: number }[],
  customers: { id: string; createdAt: Date }[],
  startingCode: number,
) {
  const orderRows: unknown[][] = [];
  const itemRows: unknown[][] = [];
  let code = startingCode;

  for (let dayOffset = DAYS; dayOffset >= 0; dayOffset--) {
    const growth = 0.5 + (1 - dayOffset / DAYS) * 0.9;
    const count = Math.round(randInt(0, 4) * growth);

    for (let n = 0; n < count; n++) {
      const day = daysAgo(dayOffset);
      const createdAt = new Date(
        Date.UTC(
          day.getUTCFullYear(),
          day.getUTCMonth(),
          day.getUTCDate(),
          randInt(14, 23),
          randInt(0, 59),
        ),
      );

      const customer = pick(customers);
      if (createdAt < customer.createdAt) continue;

      const orderId = makeId();
      const lineCount = randInt(1, 3);
      let subtotalCents = 0;

      const chosen = new Set<string>();
      for (let i = 0; i < lineCount; i++) {
        const product = pick(products);
        if (chosen.has(product.id)) continue;
        chosen.add(product.id);

        const quantity = randInt(1, 2);
        subtotalCents += product.priceCents * quantity;

        itemRows.push([
          makeId(),
          orderId,
          product.id,
          product.name,
          product.slug,
          product.priceCents,
          quantity,
        ]);
      }

      if (subtotalCents === 0) continue;

      const discountCents = rand() < 0.25 ? Math.round(subtotalCents * 0.1) : 0;
      const shippingCents = subtotalCents - discountCents >= 7500 ? 0 : 999;
      const taxCents = Math.round((subtotalCents - discountCents) * 0.05);
      const totalCents =
        subtotalCents - discountCents + shippingCents + taxCents;

      const age = dayOffset;
      const roll = rand();
      let status: string;
      // Recent orders are still working through fulfilment; old ones are done.
      if (age < 3) status = roll < 0.6 ? 'PAID' : 'FULFILLED';
      else if (age < 10) status = roll < 0.25 ? 'FULFILLED' : 'SHIPPED';
      else if (roll < 0.04) status = 'REFUNDED';
      else if (roll < 0.07) status = 'CANCELLED';
      else status = 'SHIPPED';

      const shippedAt =
        status === 'SHIPPED'
          ? sqlTimestamp(new Date(createdAt.getTime() + randInt(24, 96) * 3600 * 1000))
          : null;

      const [city, province, postalCode] = pick(CITIES);

      orderRows.push([
        orderId,
        `OR-${String(code++).padStart(4, '0')}`,
        customer.id,
        status,
        'CAD',
        subtotalCents,
        discountCents,
        shippingCents,
        taxCents,
        totalCents,
        city,
        province,
        postalCode,
        'CA',
        shippedAt,
        sqlTimestamp(createdAt),
        sqlTimestamp(createdAt),
      ]);
    }
  }

  return { orderRows, itemRows, nextCode: code };
}

function buildSubscriptions(customers: { id: string; createdAt: Date }[]) {
  const rows: unknown[][] = [];

  for (const customer of customers) {
    if (rand() > 0.35) continue;

    const plan = pickWeighted(MEMBERSHIP_PLANS);
    const startedAt = daysAgo(randInt(5, DAYS));
    const periodStart = daysAgo(randInt(0, 28));
    const periodEnd = new Date(periodStart.getTime() + 30 * 24 * 3600 * 1000);
    // A handful of lapsed members so the mix is not uniformly healthy.
    const status = rand() < 0.88 ? 'active' : 'canceled';

    rows.push([
      makeId(),
      plan.name,
      customer.id,
      status,
      sqlTimestamp(status === 'active' ? periodStart : startedAt),
      sqlTimestamp(periodEnd),
      rand() < 0.1,
      'month',
    ]);
  }

  return rows;
}

/** Only these names are generated here, so --reset can remove exactly them. */
const CERTIFICATION_NAMES = [
  'Registered Massage Therapist',
  'CPR Level C',
  'Laser Safety Officer',
  'IV Therapy Certification',
];

function buildCertifications(employees: Employee[]) {
  const rows: unknown[][] = [];

  for (const employee of employees) {
    for (const name of CERTIFICATION_NAMES.slice(0, randInt(1, 3))) {
      const roll = rand();
      // Deliberately seed a couple of expired/expiring certs so the
      // compliance panel on the dashboard has something to show.
      let expiresAt: Date;
      if (roll < 0.15) expiresAt = daysAgo(randInt(1, 30));
      else if (roll < 0.4) expiresAt = daysAgo(-randInt(1, 55));
      else expiresAt = daysAgo(-randInt(120, 900));

      const createdAt = daysAgo(randInt(200, 700));
      rows.push([
        makeId(),
        employee.id,
        name,
        sqlTimestamp(expiresAt),
        sqlTimestamp(createdAt),
        sqlTimestamp(createdAt),
      ]);
    }
  }

  return rows;
}

// ----------------------------------------------------------------------- main

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to seed history in production.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: getPoolConnectionString() });
  const client = await pool.connect();

  try {
    const reference = await loadReferenceData(client);

    if (
      reference.employees.length === 0 ||
      reference.services.length === 0 ||
      reference.products.length === 0
    ) {
      console.error(
        'No base data found. Run `pnpm db:seed` first — this script layers history on top of it.',
      );
      process.exit(1);
    }

    await client.query('BEGIN');

    if (RESET) {
      console.log('Removing previously generated history...');
      const removed = await clearHistory(client);
      console.log(
        `  bookings ${removed.bookings}, orders ${removed.orders}, ` +
          `subscriptions ${removed.subscriptions}, customers ${removed.customers}`,
      );
    }

    console.log(`Creating ${CUSTOMER_COUNT} customers...`);
    const customers = buildCustomers();
    await insertRows(
      client,
      'user',
      [
        'id', 'name', 'email', 'emailVerified', 'createdAt', 'updatedAt',
        'role', 'firstName', 'lastName', 'phoneNumber', 'marketingOptIn',
        'city', 'province', 'postalCode', 'country',
      ],
      customers.rows,
    );

    const bookingCodeStart = await nextSequenceBlock(client, 'booking_code_seq');
    console.log(`Creating bookings across ${DAYS} days...`);
    const bookings = buildBookings(
      reference,
      customers.ids,
      bookingCodeStart,
    );
    await insertRows(
      client,
      'booking',
      [
        'id', 'bookingCode', 'customerUserId', 'employeeId', 'serviceId',
        'locationId', 'startTime', 'endTime', 'durationMinutes', 'status',
        'paymentStatus', 'priceCents', 'currency', 'cancelledAt',
        'createdAt', 'updatedAt',
      ],
      bookings.rows,
    );
    await client.query(`SELECT setval('booking_code_seq', $1)`, [
      bookings.nextCode,
    ]);

    const orderCodeStart = await nextSequenceBlock(client, 'order_code_seq');
    console.log('Creating orders...');
    const orders = buildOrders(reference.products, customers.ids, orderCodeStart);
    await insertRows(
      client,
      'order',
      [
        'id', 'orderCode', 'userId', 'status', 'currency', 'subtotalCents',
        'discountCents', 'shippingCents', 'taxCents', 'totalCents',
        'shippingCity', 'shippingProvince', 'shippingPostalCode',
        'shippingCountry', 'shippedAt', 'createdAt', 'updatedAt',
      ],
      orders.orderRows,
    );
    // Items reference orders, so they go in second.
    const orderIds = new Set(orders.orderRows.map((row) => row[0] as string));
    await insertRows(
      client,
      'order_item',
      ['id', 'orderId', 'productId', 'name', 'slug', 'unitPriceCents', 'quantity'],
      orders.itemRows.filter((row) => orderIds.has(row[1] as string)),
    );
    await client.query(`SELECT setval('order_code_seq', $1)`, [orders.nextCode]);

    console.log('Creating memberships...');
    await insertRows(
      client,
      'subscription',
      [
        'id', 'plan', 'referenceId', 'status', 'periodStart', 'periodEnd',
        'cancelAtPeriodEnd', 'billingInterval',
      ],
      buildSubscriptions(customers.ids),
    );

    console.log('Creating certifications...');
    await insertRows(
      client,
      'employee_certification',
      ['id', 'employeeId', 'name', 'expiresAt', 'createdAt', 'updatedAt'],
      buildCertifications(reference.employees),
    );

    console.log('Adjusting stock levels...');
    // Push a few products under their threshold so the low-stock panel is live.
    await client.query(`
      UPDATE "inventory_level"
      SET quantity = FLOOR(random() * 4)
      WHERE "productId" IN (
        SELECT id FROM "product" WHERE "deletedAt" IS NULL ORDER BY id LIMIT 3
      )
    `);

    await client.query('COMMIT');

    console.log('\nHistory seeded:');
    console.log(`  customers:     ${customers.rows.length}`);
    console.log(`  bookings:      ${bookings.rows.length}`);
    console.log(`  orders:        ${orders.orderRows.length}`);
    console.log(`  order items:   ${orders.itemRows.length}`);
    console.log(`  spanning:      ${DAYS} days`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Removes what a previous run of this script created, and nothing else.
 *
 * Customers are matched by the generated email domain; bookings, orders and
 * subscriptions are removed by their link to those customers, so anything
 * belonging to a real account survives. Certifications are matched by the
 * fixed set of names above, leaving the regular seed's own certs in place.
 */
async function clearHistory(client: PoolClient) {
  const seeded = `SELECT id FROM "user" WHERE email LIKE '%${GENERATED_EMAIL_DOMAIN}'`;

  const bookings = await client.query(
    `DELETE FROM "booking" WHERE "customerUserId" IN (${seeded})`,
  );
  await client.query(
    `DELETE FROM "order_item" WHERE "orderId" IN (
       SELECT id FROM "order" WHERE "userId" IN (${seeded})
     )`,
  );
  const orders = await client.query(
    `DELETE FROM "order" WHERE "userId" IN (${seeded})`,
  );
  const subscriptions = await client.query(
    `DELETE FROM "subscription" WHERE "referenceId" IN (${seeded})`,
  );
  await client.query(`DELETE FROM "employee_certification" WHERE name = ANY($1)`, [
    CERTIFICATION_NAMES,
  ]);
  const customers = await client.query(
    `DELETE FROM "user" WHERE email LIKE '%${GENERATED_EMAIL_DOMAIN}'`,
  );

  return {
    bookings: bookings.rowCount ?? 0,
    orders: orders.rowCount ?? 0,
    subscriptions: subscriptions.rowCount ?? 0,
    customers: customers.rowCount ?? 0,
  };
}

/** Current sequence high-water mark, so generated codes continue from it. */
async function nextSequenceBlock(client: PoolClient, sequence: string) {
  const { rows } = await client.query<{ last_value: string }>(
    `SELECT last_value FROM ${sequence}`,
  );
  return Number(rows[0].last_value) + 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
