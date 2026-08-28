import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import {
  reversalForBrand,
  splitOrderAcrossBrands,
  type BrandLineTotals,
  type BrandSplit,
  type OrderMoney,
} from '../../../common/helpers/brand-split';
import { PrismaService } from '../../database/postgres/prisma.service';
import { StripeCatalogService } from './stripe-catalog.service';
import { StripeConnectService } from './stripe-connect.service';

/**
 * Moves each non-platform brand's share of an order out of the platform Stripe
 * balance, and claws it back on refunds and lost disputes.
 *
 * Every operation here is idempotent and re-runnable: `handleEvent` records its
 * dedupe row only after the handler returns, so a Stripe retry can land while
 * the first delivery is still in flight. Transfers and reversals are therefore
 * both guarded by stored state *and* Stripe idempotency keys.
 */
@Injectable()
export class BrandPayoutService {
  private readonly logger = new Logger(BrandPayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalog: StripeCatalogService,
    private readonly connect: StripeConnectService,
  ) {}

  /**
   * Per-line tax and the price->brand mapping for a completed session.
   * Checkout webhooks do not carry line items, so they are fetched.
   */
  async fetchLineTaxByPriceId(
    sessionId: string,
  ): Promise<Map<string, number> | null> {
    const stripe = this.catalog.stripe;
    if (!stripe) return null;

    try {
      const byPrice = new Map<string, number>();
      for await (const line of stripe.checkout.sessions.listLineItems(
        sessionId,
        { limit: 100 },
      )) {
        const priceId = line.price?.id;
        if (!priceId) continue;
        byPrice.set(
          priceId,
          (byPrice.get(priceId) ?? 0) + (line.amount_tax ?? 0),
        );
      }
      return byPrice;
    } catch (error) {
      this.logger.warn(
        `Could not read line items for session ${sessionId}: ${
          error instanceof Error ? error.message : String(error)
        } — falling back to proportional tax`,
      );
      return null;
    }
  }

  /**
   * The charge behind a PaymentIntent plus the Stripe fee taken off it.
   * The fee is what each brand's transfer is reduced by, so nobody subsidises
   * another brand's processing cost.
   */
  async fetchChargeFacts(paymentIntentId: string): Promise<{
    chargeId: string | null;
    feeCents: number | null;
  }> {
    const stripe = this.catalog.stripe;
    if (!stripe) return { chargeId: null, feeCents: null };

    try {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['latest_charge.balance_transaction'],
      });

      const charge = intent.latest_charge as Stripe.Charge | null;
      if (!charge) return { chargeId: null, feeCents: null };

      const balanceTransaction =
        charge.balance_transaction as Stripe.BalanceTransaction | null;

      return {
        chargeId: charge.id,
        // null (not 0) when unknown — 0 would silently over-transfer.
        feeCents:
          balanceTransaction && typeof balanceTransaction === 'object'
            ? balanceTransaction.fee
            : null,
      };
    } catch (error) {
      this.logger.error(
        `Could not read charge for payment intent ${paymentIntentId}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return { chargeId: null, feeCents: null };
    }
  }

  /** Groups cart lines by brand and applies the allocation rules. */
  buildSplits(input: {
    lines: BrandLineTotals[];
    money: OrderMoney;
  }): BrandSplit[] {
    return splitOrderAcrossBrands(input.lines, input.money);
  }

  /**
   * Creates the outstanding Stripe Transfers for an order. Safe to call
   * repeatedly — rows already PAID/PENDING are skipped, and the idempotency key
   * is derived from the order and brand so a duplicate call cannot double-pay.
   *
   * A brand that has not finished Connect onboarding is parked as
   * AWAITING_ONBOARDING rather than blocking the order: the customer has
   * already paid, and the platform simply owes that brand until it can be paid.
   */
  async settleOrderTransfers(orderId: string): Promise<void> {
    if (!this.connect.isEnabled) return;

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { brandSplits: { include: { brand: true } } },
    });

    if (!order) {
      this.logger.warn(`settleOrderTransfers: order ${orderId} not found`);
      return;
    }

    if (!order.stripeChargeId) {
      this.logger.warn(
        `Order ${order.orderCode} has no charge id — cannot transfer yet`,
      );
      return;
    }

    for (const split of order.brandSplits) {
      if (split.brand.isPlatform) continue;
      if (split.transferStatus === 'PENDING' || split.transferStatus === 'PAID')
        continue;
      if (split.stripeTransferId) continue;
      if (split.transferCents <= 0) continue;

      if (!split.brand.stripeAccountId || !split.brand.payoutsEnabled) {
        await this.prisma.orderBrandSplit.update({
          where: { id: split.id },
          data: {
            transferStatus: 'AWAITING_ONBOARDING',
            transferError: split.brand.stripeAccountId
              ? 'Connected account cannot receive payouts yet'
              : 'Brand has no connected account yet',
          },
        });
        this.logger.warn(
          `Order ${order.orderCode}: ${split.transferCents} cents owed to ${split.brand.name} is parked until onboarding completes`,
        );
        continue;
      }

      try {
        const transfer = await this.connect.createTransfer({
          amountCents: split.transferCents,
          currency: order.currency,
          destinationAccountId: split.brand.stripeAccountId,
          sourceChargeId: order.stripeChargeId,
          // Must match what was set on the PaymentIntent at checkout, or Stripe
          // will not group the charge and its transfers together.
          transferGroup: order.stripeTransferGroup ?? order.stripeChargeId,
          // Stable across retries of the same event and across manual retries,
          // but distinct per attempt so a legitimate re-transfer (dispute won
          // after a reversal) is not deduplicated against the original.
          idempotencyKey: `transfer:${order.id}:${split.brandId}:${split.transferAttempt}`,
          metadata: {
            orderId: order.id,
            orderCode: order.orderCode,
            brandId: split.brandId,
          },
        });

        await this.prisma.orderBrandSplit.update({
          where: { id: split.id },
          data: {
            stripeTransferId: transfer.id,
            transferStatus: 'PENDING',
            transferError: null,
          },
        });

        this.logger.log(
          `Order ${order.orderCode}: transferred ${split.transferCents} cents to ${split.brand.name} (${transfer.id})`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.orderBrandSplit.update({
          where: { id: split.id },
          data: { transferStatus: 'FAILED', transferError: message },
        });
        this.logger.error(
          `Order ${order.orderCode}: transfer to ${split.brand.name} failed — ${message}`,
        );
      }
    }
  }

  /**
   * Reverses each brand's proportional share after a refund or a lost dispute.
   * `reverse_transfer` on the refund only applies to destination charges, so
   * with separate transfers every one must be reversed explicitly.
   */
  async reverseOrderTransfers(input: {
    orderId: string;
    refundedCents: number;
    reason: 'refund' | 'dispute';
  }): Promise<void> {
    if (!this.connect.isEnabled) return;

    const order = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      include: { brandSplits: { include: { brand: true } } },
    });
    if (!order) return;

    for (const split of order.brandSplits) {
      if (!split.stripeTransferId) continue;
      if (split.brand.isPlatform) continue;

      const amount = reversalForBrand({
        brandGrossCents: split.grossCents,
        brandTransferCents: split.transferCents,
        brandReversedCents: split.reversedCents,
        orderTotalCents: order.totalCents,
        refundedCents: input.refundedCents,
      });
      if (amount <= 0) continue;

      try {
        await this.connect.reverseTransfer({
          transferId: split.stripeTransferId,
          amountCents: amount,
          idempotencyKey: `reversal:${input.reason}:${order.id}:${split.brandId}:${input.refundedCents}`,
          metadata: {
            orderId: order.id,
            orderCode: order.orderCode,
            brandId: split.brandId,
            reason: input.reason,
          },
        });

        const reversedTotal = split.reversedCents + amount;
        await this.prisma.orderBrandSplit.update({
          where: { id: split.id },
          data: {
            reversedCents: reversedTotal,
            transferStatus:
              reversedTotal >= split.transferCents
                ? 'REVERSED'
                : 'PARTIALLY_REVERSED',
          },
        });

        this.logger.log(
          `Order ${order.orderCode}: reversed ${amount} cents from ${split.brand.name} (${input.reason})`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.prisma.orderBrandSplit.update({
          where: { id: split.id },
          data: { transferError: message },
        });
        // A reversal can fail when the connected account has already paid out.
        // Loud, because it means money must be recovered by invoice instead.
        this.logger.error(
          `Order ${order.orderCode}: REVERSAL FAILED for ${split.brand.name} — ${message}. Recover ${amount} cents manually.`,
        );
      }
    }
  }
}
