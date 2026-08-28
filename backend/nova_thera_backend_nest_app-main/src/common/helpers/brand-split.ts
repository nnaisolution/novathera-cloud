/**
 * Splits one order's money across the brands that contributed items to it.
 *
 * The storefront takes a single payment into the platform brand's Stripe
 * account. Every other brand is then paid by Transfer, so these numbers decide
 * how much real money moves — they have to reconcile to the cent.
 *
 * Two invariants hold for every result:
 *   1. `sum(grossCents) === totalCents` (what the customer actually paid)
 *   2. `sum(stripeFeeCents) === stripeFeeCents` passed in
 *
 * Allocation rules (proportional to each brand's share of the line subtotal):
 *   - discount  — cart-wide promo codes are spread across brands
 *   - shipping  — one shipping charge covers the whole parcel
 *   - tax       — per-line when Stripe gives it to us, proportional otherwise
 *   - Stripe fee — spread by each brand's share of gross, so nobody subsidises
 *                  another brand's processing cost
 */

export type BrandLineTotals = {
  brandId: string;
  isPlatform: boolean;
  /** Sum of unitPrice * quantity for this brand's lines, before any discount. */
  lineSubtotalCents: number;
  /**
   * Tax Stripe attributed to this brand's line items. Null when the session had
   * no per-line tax breakdown, in which case order tax is split proportionally.
   */
  lineTaxCents: number | null;
};

export type OrderMoney = {
  /** `session.amount_subtotal` — line items before discount and tax. */
  subtotalCents: number;
  /** `session.total_details.amount_discount` */
  discountCents: number;
  /** `session.total_details.amount_shipping` */
  shippingCents: number;
  /** `session.total_details.amount_tax` */
  taxCents: number;
  /** `session.amount_total` — the authoritative amount charged. */
  totalCents: number;
  /** Stripe processing fee from the charge's balance transaction. */
  stripeFeeCents: number;
};

/**
 * Thrown when the per-brand parts cannot be made to agree with what Stripe
 * actually charged. Callers must treat this as fatal for the transfer step —
 * park the split for manual review rather than move a guessed amount.
 */
export class BrandSplitReconciliationError extends Error {
  constructor(
    readonly expectedTotalCents: number,
    readonly actualTotalCents: number,
  ) {
    super(
      `Brand split does not reconcile: parts sum to ${actualTotalCents} but the charge was ${expectedTotalCents}`,
    );
    this.name = 'BrandSplitReconciliationError';
  }
}

export type BrandSplit = {
  brandId: string;
  isPlatform: boolean;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  grossCents: number;
  stripeFeeCents: number;
  /** What actually transfers out. Always 0 for the platform brand. */
  transferCents: number;
};

/**
 * Distributes `amount` across `weights` as whole cents, using the largest
 * remainder method so the parts always sum back to `amount` exactly.
 *
 * Falls back to an even spread when every weight is zero (e.g. a 100%-off cart
 * still has shipping to apportion).
 */
export function allocateProportional(
  amount: number,
  weights: number[],
): number[] {
  const count = weights.length;
  if (count === 0) return [];
  if (amount === 0) return new Array<number>(count).fill(0);

  const safeWeights = weights.map((w) => (w > 0 ? w : 0));
  const totalWeight = safeWeights.reduce((sum, w) => sum + w, 0);
  const effective =
    totalWeight > 0 ? safeWeights : new Array<number>(count).fill(1);
  const effectiveTotal = totalWeight > 0 ? totalWeight : count;

  const exact = effective.map((w) => (amount * w) / effectiveTotal);
  const floored = exact.map((value) => Math.floor(value));
  let remainder = amount - floored.reduce((sum, value) => sum + value, 0);

  // Hand the leftover cents to the largest fractional parts first, breaking
  // ties by index so the result is deterministic across replays.
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  const result = [...floored];
  for (const { index } of order) {
    if (remainder <= 0) break;
    result[index] += 1;
    remainder -= 1;
  }

  return result;
}

export function splitOrderAcrossBrands(
  lines: BrandLineTotals[],
  money: OrderMoney,
): BrandSplit[] {
  if (lines.length === 0) return [];

  const weights = lines.map((line) => line.lineSubtotalCents);

  // Allocate against Stripe's own subtotal rather than our cart total, so a
  // price that drifted between "add to cart" and "pay" can't desync the split.
  const subtotals = allocateProportional(money.subtotalCents, weights);
  const discounts = allocateProportional(money.discountCents, weights);
  const shipping = allocateProportional(money.shippingCents, weights);

  const hasPerLineTax = lines.every((line) => line.lineTaxCents !== null);
  const taxes = hasPerLineTax
    ? reconcileToTotal(
        lines.map((line) => line.lineTaxCents as number),
        money.taxCents,
      )
    : allocateProportional(money.taxCents, weights);

  const gross = lines.map(
    (_, i) => subtotals[i] - discounts[i] + shipping[i] + taxes[i],
  );

  // Each allocation above sums exactly, so `gross` should already equal
  // amount_total via Stripe's own identity
  // (total = subtotal - discount + tax + shipping). Anything beyond a cent or
  // two per brand means an input is wrong — refuse rather than transfer a
  // guessed amount out of the platform balance.
  const grossSum = gross.reduce((sum, value) => sum + value, 0);
  if (Math.abs(money.totalCents - grossSum) > lines.length) {
    throw new BrandSplitReconciliationError(money.totalCents, grossSum);
  }

  const reconciledGross = reconcileToTotal(gross, money.totalCents);
  const fees = allocateProportional(money.stripeFeeCents, reconciledGross);

  return lines.map((line, i) => {
    const grossCents = reconciledGross[i];
    const stripeFeeCents = fees[i];
    return {
      brandId: line.brandId,
      isPlatform: line.isPlatform,
      subtotalCents: subtotals[i],
      discountCents: discounts[i],
      shippingCents: shipping[i],
      taxCents: taxes[i],
      grossCents,
      stripeFeeCents,
      // The platform brand's money is already in the right account.
      transferCents: line.isPlatform
        ? 0
        : Math.max(0, grossCents - stripeFeeCents),
    };
  });
}

/**
 * Nudges `parts` so they sum to `total`, spreading the correction a cent at a
 * time over the largest entries first and never taking one below zero. Used
 * where an identity should already hold and we only expect rounding drift.
 */
function reconcileToTotal(parts: number[], total: number): number[] {
  const result = [...parts];
  let drift = total - result.reduce((sum, value) => sum + value, 0);
  if (drift === 0) return result;

  const order = result
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value || a.index - b.index)
    .map(({ index }) => index);

  const step = drift > 0 ? 1 : -1;
  // Bounded: each sweep moves at least one cent unless nothing can absorb it.
  let sweeps = Math.abs(drift) + 1;
  while (drift !== 0 && sweeps > 0) {
    let moved = false;
    for (const index of order) {
      if (drift === 0) break;
      if (step < 0 && result[index] === 0) continue;
      result[index] += step;
      drift -= step;
      moved = true;
    }
    if (!moved) break;
    sweeps -= 1;
  }

  return result;
}

/**
 * Portion of a brand's transfer to claw back when `refundedCents` of the order
 * total is refunded or disputed. Proportional to that brand's share of gross,
 * capped at what is still outstanding on the transfer.
 */
export function reversalForBrand(input: {
  brandGrossCents: number;
  brandTransferCents: number;
  brandReversedCents: number;
  orderTotalCents: number;
  refundedCents: number;
}): number {
  if (input.orderTotalCents <= 0 || input.brandTransferCents <= 0) return 0;

  const isFullRefund = input.refundedCents >= input.orderTotalCents;
  const target = isFullRefund
    ? input.brandTransferCents
    : Math.round(
        (input.brandTransferCents * input.refundedCents) /
          input.orderTotalCents,
      );

  const outstanding = input.brandTransferCents - input.brandReversedCents;
  return Math.max(0, Math.min(target, outstanding));
}
