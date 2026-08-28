import 'dotenv/config';
import { Pool } from 'pg';

/**
 * Bootstrap the FIRST admin account.
 *
 * Self-signup always assigns the 'customer' role, and staff creation via the
 * employees flow requires an existing admin — so the first admin must be
 * promoted out-of-band. This script promotes an already-registered user.
 *
 * Steps:
 *   1. Register normally at the public site (http://localhost:3000/register).
 *   2. ADMIN_EMAIL=you@example.com pnpm admin:create
 *   3. Log in at the admin app (http://localhost:3001/login).
 *
 * The account itself is created through Better Auth's regular sign-up so
 * password hashing, the linked account row, and the Stripe customer all follow
 * library conventions; this script only flips role + emailVerified.
 */

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`${name} is required. Example:`);
    console.error('  ADMIN_EMAIL=you@example.com pnpm admin:create');
    process.exit(1);
  }
  return value;
}

function getPoolConnectionString(): string {
  const databaseUrl = requireEnv('DATABASE_URL');
  // Prisma adds ?schema=public — node-pg does not accept that query param.
  return databaseUrl.replace(/\?.*$/, '');
}

async function main() {
  const email = requireEnv('ADMIN_EMAIL').toLowerCase();
  const pool = new Pool({ connectionString: getPoolConnectionString() });

  try {
    const updated = await pool.query<{ id: string }>(
      `UPDATE "user" SET role = 'admin', "emailVerified" = true, "updatedAt" = NOW()
       WHERE lower(email) = $1
       RETURNING id`,
      [email],
    );

    if (updated.rows.length === 0) {
      console.error(`No user found with email ${email}.`);
      console.error(
        'Register first at the public site (http://localhost:3000/register), then re-run this script.',
      );
      process.exit(1);
    }

    console.log(`${email} is now an admin with a verified email.`);
    console.log('Log in at the admin app (http://localhost:3001/login).');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to promote admin:', error);
  process.exit(1);
});
