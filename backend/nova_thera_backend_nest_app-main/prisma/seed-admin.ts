/**
 * Idempotent bootstrap admin for the admin app at http://localhost:3001.
 *
 * Creates (or updates) a Better Auth email/password user with role `admin`
 * and a verified email so login skips /verify-email. Password is hashed with
 * Better Auth's own `hashPassword` (scrypt) — the same hasher used by
 * `auth.api.createUser` / `signUpEmail` / staff creation.
 *
 * Permissions are not Prisma rows: Better Auth's admin plugin reads
 * `User.role === 'admin'` and applies the in-code `roles.admin` access
 * control from `src/authentication/permissions.ts`.
 *
 *   pnpm db:seed:admin
 *   npx tsx prisma/seed-admin.ts
 */
import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { hashPassword } from 'better-auth/crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

config({ path: resolve(__dirname, '../.env') });

const ADMIN_EMAIL = 'admin@novathera.ca';
const ADMIN_PASSWORD = 'NovaThera@123';
const ADMIN_NAME = 'Nova Thera Admin';
const ADMIN_FIRST_NAME = 'Nova';
const ADMIN_LAST_NAME = 'Thera';
/** Better Auth admin plugin + AuthGuard staff set. Do not invent a different string. */
const ADMIN_ROLE = 'admin';
const CREDENTIAL_PROVIDER = 'credential';

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

async function upsertAdmin(prisma: PrismaClient) {
  const email = ADMIN_EMAIL.toLowerCase();
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const existing = await prisma.user.findUnique({ where: { email } });
  const userData = {
    name: ADMIN_NAME,
    firstName: ADMIN_FIRST_NAME,
    lastName: ADMIN_LAST_NAME,
    emailVerified: true,
    role: ADMIN_ROLE,
    banned: false,
    banReason: null,
    banExpires: null,
  };

  const user = existing
    ? await prisma.user.update({ where: { id: existing.id }, data: userData })
    : await prisma.user.create({
        data: {
          id: randomUUID(),
          email,
          ...userData,
        },
      });

  const credential = await prisma.account.findFirst({
    where: { userId: user.id, providerId: CREDENTIAL_PROVIDER },
  });

  if (credential) {
    await prisma.account.update({
      where: { id: credential.id },
      data: { password: hashedPassword, accountId: user.id },
    });
  } else {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: CREDENTIAL_PROVIDER,
        password: hashedPassword,
      },
    });
  }

  return { user, created: !existing, passwordUpdated: true };
}

async function main() {
  const prisma = createPrisma();
  try {
    console.log(`Seeding admin ${ADMIN_EMAIL}…`);
    const { user, created } = await upsertAdmin(prisma);
    console.log(
      created
        ? `  created user ${user.id}`
        : `  updated existing user ${user.id}`,
    );
    console.log(`  email: ${user.email}`);
    console.log(`  role: ${user.role} (Better Auth admin plugin + AuthGuard)`);
    console.log(`  emailVerified: ${user.emailVerified}`);
    console.log(
      '  password: hashed with better-auth/crypto hashPassword (scrypt)',
    );
    console.log(
      '  credential account: providerId=credential, accountId=user.id',
    );
    console.log(
      '  permissions: in-code roles.admin (no Permission/Role tables)',
    );
    console.log('\nAdmin seed complete. Log in at http://localhost:3001/login');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error('Admin seed failed:', error);
  process.exit(1);
});
