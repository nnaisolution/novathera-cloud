import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import {
  BrandSplitReconciliationError,
  splitOrderAcrossBrands,
  type BrandLineTotals,
} from '../../../common/helpers/brand-split';
import { StripeConfigService } from '../../../config/stripe/config.service';
import { PrismaService } from '../../database/postgres/prisma.service';
import { MailService } from '../../mail/resend/mail.service';
import { BrandPayoutService } from './brand-payout.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly payouts: BrandPayoutService,
    private readonly stripeConfig: StripeConfigService,
  ) {}

  async handleEvent(event: Stripe.Event): Promise<void> {
    const alreadyProcessed = await this.prisma.stripeWebhookEvent.findUnique({
      where: { id: event.id },
    });
    if (alreadyProcessed) {
      this.logger.debug(`Skipping duplicate Stripe event ${event.id}`);
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutSessionCompleted(event.data.object);
        break;
      case 'charge.refunded':
        await this.onChargeRefunded(event.data.object);
        break;
      case 'charge.dispute.created':
        await this.onDisputeCreated(event.data.object);
        break;
      case 'charge.dispute.closed':
        await this.onDisputeClosed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }

    await this.prisma.stripeWebhookEvent.create({
      data: {
        id: event.id,
        type: event.type,
      },
    });
  }

  private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const bookingId = session.metadata?.bookingId;
    const cartId = session.metadata?.cartId;
    const purpose = session.metadata?.purpose;

    if (purpose === 'booking' || bookingId) {
      await this.fulfillBookingPayment(session, bookingId);
      return;
    }

    if (purpose === 'shop' || cartId) {
      await this.fulfillShopOrder(session, cartId);
    }
  }

  private async fulfillBookingPayment(
    session: Stripe.Checkout.Session,
    bookingId: string | undefined,
  ) {
    if (!bookingId) {
      this.logger.warn(
        `checkout.session.completed missing bookingId (session ${session.id})`,
      );
      return;
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, deletedAt: null },
    });
    if (!booking) {
      this.logger.warn(
        `Booking ${bookingId} not found for session ${session.id}`,
      );
      return;
    }

    if (
      session.amount_total != null &&
      session.amount_total !== booking.priceCents
    ) {
      this.logger.error(
        `Amount mismatch for booking ${bookingId}: expected ${booking.priceCents}, got ${session.amount_total}`,
      );
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'PAID',
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId ?? null,
      },
    });
  }

  private async fulfillShopOrder(
    session: Stripe.Checkout.Session,
    cartId: string | undefined,
  ) {
    if (!cartId) {
      this.logger.warn(
        `checkout.session.completed missing cartId (session ${session.id})`,
      );
      return;
    }

    const existing = await this.prisma.order.findFirst({
      where: { stripeCheckoutSessionId: session.id },
    });
    if (existing) {
      // A retry of an event whose first delivery died after the order was
      // written but before the transfers went out.
      await this.payouts.settleOrderTransfers(existing.id);
      return;
    }

    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      this.logger.warn(
        `Cart ${cartId} empty or missing for session ${session.id}`,
      );
      return;
    }

    const shippingDetails = session.collected_information?.shipping_details;
    const address = shippingDetails?.address;
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;

    // What Stripe actually charged and kept, plus per-line tax. Needed before
    // the order is written so the brand split is stored with it.
    const { chargeId, feeCents } = paymentIntentId
      ? await this.payouts.fetchChargeFacts(paymentIntentId)
      : { chargeId: null, feeCents: null };

    const lineTaxByPrice = await this.payouts.fetchLineTaxByPriceId(session.id);

    const money = {
      subtotalCents: session.amount_subtotal ?? 0,
      discountCents: session.total_details?.amount_discount ?? 0,
      shippingCents: session.total_details?.amount_shipping ?? 0,
      taxCents: session.total_details?.amount_tax ?? 0,
      totalCents: session.amount_total ?? 0,
      stripeFeeCents: feeCents ?? 0,
    };

    const brandLines = this.groupCartByBrand(cart.items, lineTaxByPrice);

    let splits: ReturnType<typeof splitOrderAcrossBrands> = [];
    let splitError: string | null = null;
    try {
      splits = splitOrderAcrossBrands(brandLines, money);
    } catch (error) {
      if (error instanceof BrandSplitReconciliationError) {
        // Record the order — the customer paid — but never guess a transfer.
        splitError = error.message;
        this.logger.error(
          `Order for session ${session.id}: ${error.message}. Transfers held for manual review.`,
        );
      } else {
        throw error;
      }
    }

    if (feeCents === null && splits.some((s) => !s.isPlatform)) {
      // Transferring gross when the fee is unknown would move more than the
      // platform actually received. Hold and let an admin retry.
      splitError =
        splitError ??
        'Stripe fee not available yet — transfers held until the charge settles';
      this.logger.warn(`Order for session ${session.id}: ${splitError}`);
    }

    const orderCode = await this.nextOrderCode();
    const brandIdByProductId = new Map(
      cart.items.map((item) => [item.productId, item.product.brandId]),
    );

    await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderCode,
          userId: cart.userId,
          status: 'PAID',
          currency: 'CAD',
          subtotalCents: money.subtotalCents,
          discountCents: money.discountCents,
          shippingCents: money.shippingCents,
          taxCents: money.taxCents,
          totalCents: money.totalCents,
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: paymentIntentId ?? null,
          stripeChargeId: chargeId,
          stripeTransferGroup: session.metadata?.transferGroup ?? null,
          stripeFeeCents: feeCents ?? 0,
          isTest: this.stripeConfig.isTestMode,
          shippingName: shippingDetails?.name ?? null,
          shippingLine1: address?.line1 ?? null,
          shippingLine2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingProvince: address?.state ?? null,
          shippingPostalCode: address?.postal_code ?? null,
          shippingCountry: address?.country ?? null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              brandId: brandIdByProductId.get(item.productId) ?? null,
              name: item.product.name,
              slug: item.product.slug,
              unitPriceCents: item.product.priceCents,
              quantity: item.quantity,
              imageUrl: item.product.images[0]?.url ?? null,
            })),
          },
          brandSplits: {
            create: splits.map((split) => ({
              brandId: split.brandId,
              subtotalCents: split.subtotalCents,
              discountCents: split.discountCents,
              shippingCents: split.shippingCents,
              taxCents: split.taxCents,
              grossCents: split.grossCents,
              stripeFeeCents: split.stripeFeeCents,
              transferCents: split.transferCents,
              transferStatus: split.isPlatform
                ? ('NOT_APPLICABLE' as const)
                : splitError
                  ? ('FAILED' as const)
                  : ('OWED' as const),
              transferError: split.isPlatform ? null : splitError,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of cart.items) {
        await tx.inventoryLevel.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return order;
    });

    if (!splitError) {
      const created = await this.prisma.order.findFirst({
        where: { stripeCheckoutSessionId: session.id },
        select: { id: true },
      });
      if (created) {
        await this.payouts.settleOrderTransfers(created.id);
      }
    }

    const order = await this.prisma.order.findFirst({
      where: { stripeCheckoutSessionId: session.id },
      include: { items: true, user: true },
    });

    if (order?.user?.email) {
      await this.mailService.sendOrderConfirmationEmail({
        to: order.user.email,
        order,
      });
    }
  }

  /**
   * Collapses cart lines into one entry per brand.
   *
   * Tax is taken from Stripe's own per-line `amount_tax` where available — it
   * is exact, unlike splitting the order total proportionally. Tax on shipping
   * is not attached to any line, so it falls out as the difference and gets
   * apportioned like shipping itself.
   */
  private groupCartByBrand(
    items: Array<{
      quantity: number;
      product: {
        brandId: string;
        priceCents: number;
        stripePriceId: string | null;
        brand: { isPlatform: boolean } | null;
      };
    }>,
    lineTaxByPrice: Map<string, number> | null,
  ): BrandLineTotals[] {
    const byBrand = new Map<string, BrandLineTotals>();

    for (const item of items) {
      const brandId = item.product.brandId;
      const entry = byBrand.get(brandId) ?? {
        brandId,
        isPlatform: item.product.brand?.isPlatform ?? false,
        lineSubtotalCents: 0,
        lineTaxCents: lineTaxByPrice ? 0 : null,
      };

      entry.lineSubtotalCents += item.product.priceCents * item.quantity;

      if (lineTaxByPrice && entry.lineTaxCents !== null) {
        const priceId = item.product.stripePriceId;
        const tax = priceId ? lineTaxByPrice.get(priceId) : undefined;
        if (tax === undefined) {
          // One unmapped line makes the whole per-line breakdown untrustworthy;
          // fall back to proportional tax for this brand.
          entry.lineTaxCents = null;
        } else {
          entry.lineTaxCents += tax;
        }
      }

      byBrand.set(brandId, entry);
    }

    return [...byBrand.values()];
  }

  /**
   * A dispute debits the platform for the full amount immediately, including
   * the part already transferred to another brand. Claw it back now rather than
   * after the dispute resolves — the money is already gone from the platform.
   */
  private async onDisputeCreated(dispute: Stripe.Dispute) {
    const chargeId =
      typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
    if (!chargeId) return;

    const order = await this.prisma.order.findFirst({
      where: { stripeChargeId: chargeId },
    });
    if (!order) return;

    await this.payouts.reverseOrderTransfers({
      orderId: order.id,
      refundedCents: dispute.amount,
      reason: 'dispute',
    });
  }

  /**
   * Dispute won — the funds come back to the platform, so re-transfer each
   * brand's share. Lost disputes keep the reversal from `onDisputeCreated`.
   */
  private async onDisputeClosed(dispute: Stripe.Dispute) {
    if (dispute.status !== 'won') return;

    const chargeId =
      typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
    if (!chargeId) return;

    const order = await this.prisma.order.findFirst({
      where: { stripeChargeId: chargeId },
      include: { brandSplits: true },
    });
    if (!order) return;

    // Reset the reversed rows so settleOrderTransfers pays them again. A fresh
    // transfer is required — a reversal cannot be undone.
    await this.prisma.orderBrandSplit.updateMany({
      where: {
        orderId: order.id,
        transferStatus: { in: ['REVERSED', 'PARTIALLY_REVERSED'] },
      },
      data: {
        transferStatus: 'OWED',
        reversedCents: 0,
        stripeTransferId: null,
        transferError: null,
        transferAttempt: { increment: 1 },
      },
    });

    await this.payouts.settleOrderTransfers(order.id);
  }

  private async onChargeRefunded(charge: Stripe.Charge) {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) return;

    const booking = await this.prisma.booking.findFirst({
      where: { stripePaymentIntentId: paymentIntentId, deletedAt: null },
    });
    if (booking) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { paymentStatus: 'REFUNDED' },
      });
      return;
    }

    const order = await this.prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntentId },
      include: { items: true },
    });
    if (!order) return;

    // `charge.refunded` fires again on each partial refund, so drive the
    // reversal off the cumulative amount rather than a one-shot status flip.
    const refundedCents = charge.amount_refunded ?? 0;
    const isFullRefund = refundedCents >= order.totalCents;

    if (order.status !== 'REFUNDED') {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { status: isFullRefund ? 'REFUNDED' : order.status },
        });

        // Only restock on a full refund — a partial one does not say which
        // items came back.
        if (isFullRefund) {
          for (const item of order.items) {
            if (item.productId) {
              await tx.inventoryLevel.updateMany({
                where: { productId: item.productId },
                data: { quantity: { increment: item.quantity } },
              });
            }
          }
        }
      });
    }

    // Claw back each brand's share. Doing this after the status update means a
    // failure here is visible on the split row without blocking the refund.
    await this.payouts.reverseOrderTransfers({
      orderId: order.id,
      refundedCents,
      reason: 'refund',
    });
  }

  private async nextOrderCode() {
    const rows = await this.prisma.$queryRaw<Array<{ nextval: bigint }>>`
      SELECT nextval('order_code_seq') AS nextval
    `;
    return `OR-${String(rows[0].nextval).padStart(4, '0')}`;
  }
}
