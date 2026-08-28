/**
 * Clears every Stripe object id stored in the database.
 *
 * Stripe ids are scoped to the mode that created them: a `prod_`, `price_`,
 * `cus_`, `sub_` or `acct_` minted in test mode does not exist in live mode.
 * Switching `STRIPE_SECRET_KEY` from test to live therefore leaves every stored
 * id pointing at nothing — checkout fails with "No such customer" and the
 * catalog cannot be priced.
 *
 * Run this once, immediately before swapping the keys:
 *
 *   pnpm stripe:reset-links            # dry run — reports what it would clear
 *   pnpm stripe:reset-links --confirm  # actually clear
 *
 * Products re-sync themselves on next write or checkout, and Better Auth
 * recreates customers on demand, so nothing needs to be recreated by hand.
 *
 * Connected account ids are cleared too: the brand must complete real KYC on a
 * live account and have its new `acct_...` written back afterwards.
 */
import 'dotenv/config';
import { Pool } from 'pg';

const CONFIRM = process.argv.includes('--confirm');
const ALSO_DELETE_TEST_ORDERS = process.argv.includes('--drop-test-orders');

type Target = {
  table: string;
  columns: string[];
  /** Extra predicate so we only count rows that actually hold a value. */
  predicate: string;
};

const TARGETS: Target[] = [
  {
    table: 'product',
    columns: ['"stripeProductId"', '"stripePriceId"'],
    predicate: '"stripeProductId" IS NOT NULL OR "stripePriceId" IS NOT NULL',
  },
  {
    table: '"user"',
    columns: ['"stripeCustomerId"'],
    predicate: '"stripeCustomerId" IS NOT NULL',
  },
  {
    table: 'subscription',
    columns: [
      '"stripeCustomerId"',
      '"stripeSubscriptionId"',
      '"stripeScheduleId"',
    ],
    predicate:
      '"stripeCustomerId" IS NOT NULL OR "stripeSubscriptionId" IS NOT NULL',
  },
  {
    table: 'discount',
    columns: ['"stripeCouponId"', '"stripePromotionCodeId"'],
    predicate:
      '"stripeCouponId" IS NOT NULL OR "stripePromotionCodeId" IS NOT NULL',
  },
  {
    table: 'booking',
    columns: ['"stripeCheckoutSessionId"', '"stripePaymentIntentId"'],
    predicate: '"stripeCheckoutSessionId" IS NOT NULL',
  },
  {
    table: '"order"',
    columns: [
      '"stripeCheckoutSessionId"',
      '"stripePaymentIntentId"',
      '"stripeChargeId"',
      '"stripeTransferGroup"',
    ],
    predicate: '"stripeCheckoutSessionId" IS NOT NULL',
  },
  {
    table: 'order_brand_split',
    columns: ['"stripeTransferId"'],
    predicate: '"stripeTransferId" IS NOT NULL',
  },
  {
    table: 'brand',
    columns: ['"stripeAccountId"'],
    predicate: '"stripeAccountId" IS NOT NULL',
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  console.log(
    CONFIRM
      ? '\nClearing Stripe links (mode switch)\n'
      : '\nDRY RUN — pass --confirm to apply\n',
  );

  try {
    await client.query('BEGIN');

    for (const target of TARGETS) {
      const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM ${target.table} WHERE ${target.predicate}`,
      );
      const count = Number(rows[0].count);

      if (count === 0) {
        console.log(`  ${target.table.padEnd(20)} nothing to clear`);
        continue;
      }

      if (CONFIRM) {
        const setClause = target.columns
          .map((column) => `${column} = NULL`)
          .join(', ');
        await client.query(
          `UPDATE ${target.table} SET ${setClause} WHERE ${target.predicate}`,
        );
      }

      console.log(
        `  ${target.table.padEnd(20)} ${count} row(s) ${
          CONFIRM ? 'cleared' : 'would be cleared'
        } (${target.columns.join(', ')})`,
      );
    }

    // Webhook dedupe keys are event ids, also mode-scoped. Harmless to keep,
    // but clearing avoids a live event colliding with a stale test id.
    if (CONFIRM) {
      await client.query('DELETE FROM stripe_webhook_event');
    }
    console.log(
      `  stripe_webhook_event ${CONFIRM ? 'cleared' : 'would be cleared'}`,
    );

    // Reset brand onboarding — a live connected account has to be re-verified.
    if (CONFIRM) {
      await client.query(
        `UPDATE brand SET "onboardingStatus" = 'NOT_STARTED', "chargesEnabled" = false,
         "payoutsEnabled" = false, "requirementsDue" = '{}', "stripeSyncedAt" = NULL
         WHERE "isPlatform" = false`,
      );
    }
    console.log(
      `  brand onboarding   ${CONFIRM ? 'reset' : 'would be reset'} for non-platform brands`,
    );

    if (ALSO_DELETE_TEST_ORDERS) {
      const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "order" WHERE "isTest" = true`,
      );
      if (CONFIRM) {
        await client.query(`DELETE FROM "order" WHERE "isTest" = true`);
        await client.query(`DELETE FROM booking WHERE "isTest" = true`);
      }
      console.log(
        `  test orders        ${rows[0].count} ${
          CONFIRM ? 'deleted' : 'would be deleted'
        } (--drop-test-orders)`,
      );
    }

    await client.query(CONFIRM ? 'COMMIT' : 'ROLLBACK');

    console.log(
      CONFIRM
        ? '\nDone. Now swap STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET to live values and redeploy.\n'
        : '\nDry run complete. Re-run with --confirm to apply.\n',
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error('reset-stripe-links failed:', error);
  process.exit(1);
});
