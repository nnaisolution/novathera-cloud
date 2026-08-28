/**
 * Regression check for the brand split math — run with `pnpm verify:brand-split`.
 *
 * These numbers decide how much real money leaves the platform account, so the
 * two invariants (gross reconciles to what Stripe charged, fees reconcile to
 * what Stripe took) are checked against awkward rounding cases, not just the
 * happy path. No DB or network needed.
 */
import {
  allocateProportional,
  splitOrderAcrossBrands,
  reversalForBrand,
  BrandSplitReconciliationError,
  type BrandLineTotals,
  type OrderMoney,
} from '../src/common/helpers/brand-split';

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}`, detail ?? '');
  }
}

console.log('\nallocateProportional');
check('sums exactly (odd split)', allocateProportional(100, [1, 1, 1]).reduce((a, b) => a + b, 0) === 100,
  allocateProportional(100, [1, 1, 1]));
check('1 cent across 3 equal', allocateProportional(1, [1, 1, 1]).join(',') === '1,0,0',
  allocateProportional(1, [1, 1, 1]));
check('zero amount', allocateProportional(0, [5, 5]).join(',') === '0,0');
check('all-zero weights spreads evenly', allocateProportional(10, [0, 0]).join(',') === '5,5',
  allocateProportional(10, [0, 0]));
check('empty', allocateProportional(10, []).length === 0);
check('proportional 2:1', allocateProportional(300, [200, 100]).join(',') === '200,100',
  allocateProportional(300, [200, 100]));
check('awkward 3-way sums', allocateProportional(1000, [333, 333, 334]).reduce((a, b) => a + b, 0) === 1000,
  allocateProportional(1000, [333, 333, 334]));

console.log('\nsplitOrderAcrossBrands — mixed cart, discount + shipping + tax');
{
  // Beauty $60.00, Wellness $40.00, 10% off, $12 shipping, 5% GST, $3.20 fee
  const lines: BrandLineTotals[] = [
    { brandId: 'beauty', isPlatform: true, lineSubtotalCents: 6000, lineTaxCents: null },
    { brandId: 'wellness', isPlatform: false, lineSubtotalCents: 4000, lineTaxCents: null },
  ];
  const money: OrderMoney = {
    subtotalCents: 10000,
    discountCents: 1000,
    shippingCents: 1200,
    taxCents: 510,
    totalCents: 10710,
    stripeFeeCents: 320,
  };
  const splits = splitOrderAcrossBrands(lines, money);
  const grossSum = splits.reduce((a, s) => a + s.grossCents, 0);
  const feeSum = splits.reduce((a, s) => a + s.stripeFeeCents, 0);
  console.log('   ', JSON.stringify(splits, null, 0));
  check('gross sums to amount_total', grossSum === money.totalCents, { grossSum, expected: money.totalCents });
  check('fees sum to charge fee', feeSum === money.stripeFeeCents, { feeSum });
  check('platform transfers nothing', splits[0].transferCents === 0);
  check('wellness transfer = gross - fee', splits[1].transferCents === splits[1].grossCents - splits[1].stripeFeeCents);
  check('never transfers more than collected', splits[1].transferCents <= splits[1].grossCents);
}

console.log('\nsplitOrderAcrossBrands — beauty-only cart');
{
  const splits = splitOrderAcrossBrands(
    [{ brandId: 'beauty', isPlatform: true, lineSubtotalCents: 5000, lineTaxCents: null }],
    { subtotalCents: 5000, discountCents: 0, shippingCents: 1000, taxCents: 300, totalCents: 6300, stripeFeeCents: 213 },
  );
  check('single brand takes everything', splits[0].grossCents === 6300, splits[0]);
  check('no transfer for platform-only order', splits[0].transferCents === 0);
}

console.log('\nsplitOrderAcrossBrands — wellness-only cart');
{
  const splits = splitOrderAcrossBrands(
    [{ brandId: 'wellness', isPlatform: false, lineSubtotalCents: 5000, lineTaxCents: null }],
    { subtotalCents: 5000, discountCents: 0, shippingCents: 1000, taxCents: 300, totalCents: 6300, stripeFeeCents: 213 },
  );
  check('transfers gross minus fee', splits[0].transferCents === 6300 - 213, splits[0]);
}

console.log('\nsplitOrderAcrossBrands — per-line tax from Stripe');
{
  const splits = splitOrderAcrossBrands(
    [
      { brandId: 'beauty', isPlatform: true, lineSubtotalCents: 6000, lineTaxCents: 300 },
      { brandId: 'wellness', isPlatform: false, lineSubtotalCents: 4000, lineTaxCents: 200 },
    ],
    { subtotalCents: 10000, discountCents: 0, shippingCents: 0, taxCents: 500, totalCents: 10500, stripeFeeCents: 335 },
  );
  check('uses per-line tax verbatim', splits[0].taxCents === 300 && splits[1].taxCents === 200, splits.map((s) => s.taxCents));
  check('gross still reconciles', splits.reduce((a, s) => a + s.grossCents, 0) === 10500);
}

console.log('\nsplitOrderAcrossBrands — 100% discount (free order)');
{
  const splits = splitOrderAcrossBrands(
    [
      { brandId: 'beauty', isPlatform: true, lineSubtotalCents: 6000, lineTaxCents: null },
      { brandId: 'wellness', isPlatform: false, lineSubtotalCents: 4000, lineTaxCents: null },
    ],
    { subtotalCents: 10000, discountCents: 10000, shippingCents: 0, taxCents: 0, totalCents: 0, stripeFeeCents: 0 },
  );
  check('nothing gross', splits.reduce((a, s) => a + s.grossCents, 0) === 0, splits);
  check('nothing transfers', splits.every((s) => s.transferCents === 0));
}

console.log('\nsplitOrderAcrossBrands — rounding stress (awkward amounts, 3 brands)');
{
  // Sweep realistic inputs: Stripe's identity always holds
  // (total = subtotal - discount + shipping + tax), so only rounding can drift.
  let bad = 0;
  let cases = 0;
  for (let subtotal = 997; subtotal <= 3000; subtotal += 13) {
    for (const discount of [0, 1, 137, Math.floor(subtotal / 3)]) {
      const shipping = 599;
      const tax = Math.round((subtotal - discount + shipping) * 0.05);
      const total = subtotal - discount + shipping + tax;
      const fee = Math.round(total * 0.029) + 30;
      cases += 1;
      const splits = splitOrderAcrossBrands(
        [
          { brandId: 'a', isPlatform: true, lineSubtotalCents: 333, lineTaxCents: null },
          { brandId: 'b', isPlatform: false, lineSubtotalCents: 333, lineTaxCents: null },
          { brandId: 'c', isPlatform: false, lineSubtotalCents: 334, lineTaxCents: null },
        ],
        { subtotalCents: subtotal, discountCents: discount, shippingCents: shipping, taxCents: tax, totalCents: total, stripeFeeCents: fee },
      );
      const grossSum = splits.reduce((a, s) => a + s.grossCents, 0);
      const feeSum = splits.reduce((a, s) => a + s.stripeFeeCents, 0);
      if (grossSum !== total) { bad += 1; console.log('    gross drift', { subtotal, discount, total, grossSum }); }
      if (feeSum !== fee) { bad += 1; console.log('    fee drift', { subtotal, feeSum, fee }); }
      if (splits.some((s) => s.transferCents < 0)) { bad += 1; console.log('    negative transfer', { subtotal }); }
      if (splits.some((s) => s.transferCents > s.grossCents)) { bad += 1; console.log('    transfer exceeds gross', { subtotal }); }
    }
  }
  check(`${cases} realistic orders reconcile exactly`, bad === 0);
}

console.log('\nsplitOrderAcrossBrands — refuses to guess on inconsistent input');
{
  let threw = false;
  try {
    splitOrderAcrossBrands(
      [
        { brandId: 'a', isPlatform: true, lineSubtotalCents: 500, lineTaxCents: null },
        { brandId: 'b', isPlatform: false, lineSubtotalCents: 500, lineTaxCents: null },
      ],
      // total is nowhere near subtotal - discount + shipping + tax
      { subtotalCents: 1000, discountCents: 0, shippingCents: 0, taxCents: 0, totalCents: 250, stripeFeeCents: 0 },
    );
  } catch (e) {
    threw = e instanceof BrandSplitReconciliationError;
  }
  check('throws BrandSplitReconciliationError rather than transferring a guess', threw);

  // One cent per brand of genuine rounding drift is tolerated and absorbed.
  let ok = false;
  try {
    const splits = splitOrderAcrossBrands(
      [
        { brandId: 'a', isPlatform: true, lineSubtotalCents: 500, lineTaxCents: null },
        { brandId: 'b', isPlatform: false, lineSubtotalCents: 500, lineTaxCents: null },
      ],
      { subtotalCents: 1000, discountCents: 0, shippingCents: 0, taxCents: 0, totalCents: 1001, stripeFeeCents: 0 },
    );
    ok = splits.reduce((a, s) => a + s.grossCents, 0) === 1001;
  } catch {
    ok = false;
  }
  check('absorbs a 1-cent rounding drift', ok);
}

console.log('\nreversalForBrand');
{
  const base = { brandGrossCents: 4284, brandTransferCents: 4148, brandReversedCents: 0, orderTotalCents: 10710 };
  check('full refund reverses whole transfer',
    reversalForBrand({ ...base, refundedCents: 10710 }) === 4148);
  check('half refund reverses ~half',
    reversalForBrand({ ...base, refundedCents: 5355 }) === 2074,
    reversalForBrand({ ...base, refundedCents: 5355 }));
  check('capped at outstanding',
    reversalForBrand({ ...base, brandReversedCents: 4000, refundedCents: 10710 }) === 148);
  check('nothing left to reverse',
    reversalForBrand({ ...base, brandReversedCents: 4148, refundedCents: 10710 }) === 0);
  check('platform brand (no transfer) reverses nothing',
    reversalForBrand({ ...base, brandTransferCents: 0, refundedCents: 10710 }) === 0);
  check('over-refund never exceeds transfer',
    reversalForBrand({ ...base, refundedCents: 99999 }) === 4148);
}

console.log(failures === 0 ? '\nALL PASS\n' : `\n${failures} FAILURE(S)\n`);
process.exit(failures === 0 ? 0 : 1);
