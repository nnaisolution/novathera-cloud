import 'dotenv/config';
import { Pool } from 'pg';

function getPoolConnectionString(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl?.trim()) {
    throw new Error('DATABASE_URL is not set');
  }

  // Prisma adds ?schema=public — node-pg does not accept that query param.
  return databaseUrl.replace(/\?.*$/, '');
}

async function main() {
  const force = process.argv.includes('--force');

  if (process.env.NODE_ENV === 'production' && !force) {
    console.error(
      'Refusing to wipe a production database. Re-run with --force if intentional.',
    );
    process.exit(1);
  }

  const pool = new Pool({ connectionString: getPoolConnectionString() });

  try {
    const { rows } = await pool.query<{ tablename: string }>(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename != '_prisma_migrations'
      ORDER BY tablename
    `);

    if (rows.length === 0) {
      console.log('No application tables found — nothing to wipe.');
      return;
    }

    const tableList = rows.map((row) => `"${row.tablename}"`).join(', ');

    await pool.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);

    console.log(`Wiped ${rows.length} tables:`);
    for (const row of rows) {
      console.log(`  - ${row.tablename}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error('Failed to wipe database:', error);
  process.exit(1);
});
