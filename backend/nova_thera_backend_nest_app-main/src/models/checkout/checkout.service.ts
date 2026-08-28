import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';
import { StripeConfigService } from '../../config/stripe/config.service';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { CheckoutRepository } from './checkout.repository';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly repository: CheckoutRepository,
    private readonly stripeCatalog: StripeCatalogService,
    private readonly stripeConfig: StripeConfigService,
  ) {}

  async createSession(userId: string) {
    const user = await this.repository.findUser(userId);
    if (!user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    if (!user.emailVerified) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Please verify your email before checkout',
      });
    }

    const stripe = this.stripeCatalog.stripe;
    if (!stripe) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Payments are not configured',
      });
    }

    const cart = await this.repository.findCartWithItems(userId);
    if (!cart || cart.items.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Your cart is empty',
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cart.items) {
      const product = item.product;
      if (product.deletedAt || product.status !== 'ACTIVE') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `${product.name} is no longer available`,
        });
      }

      let stripePriceId = product.stripePriceId;
      if (!stripePriceId) {
        // Products created before Stripe was configured have no Price yet —
        // sync now so checkout still works after adding STRIPE_SECRET_KEY.
        const synced = await this.stripeCatalog.syncProduct({
          id: product.id,
          name: product.name,
          description: product.description,
          priceCents: product.priceCents,
          currency: product.currency,
          stripeProductId: product.stripeProductId,
          stripePriceId: product.stripePriceId,
          metadata: { type: 'product', brandId: product.brandId },
        });
        if (!synced) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `${product.name} is not available for checkout`,
          });
        }
        await this.repository.updateProductStripeIds(
          product.id,
          synced.stripeProductId,
          synced.stripePriceId,
        );
        stripePriceId = synced.stripePriceId;
      }

      const inventory = product.inventory;
      if (
        !inventory ||
        (!inventory.allowBackorder && inventory.quantity < item.quantity)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Insufficient stock for ${product.name}`,
        });
      }

      lineItems.push({
        price: stripePriceId,
        quantity: item.quantity,
      });
    }

    const subtotalCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceCents * item.quantity,
      0,
    );

    const tiers = await this.repository.findActiveShippingTiers();
    if (tiers.length === 0) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'No shipping options are available',
      });
    }

    const shippingOptions: Stripe.Checkout.SessionCreateParams.ShippingOption[] =
      tiers.map((tier) => {
        const isFree =
          tier.freeOverCents != null && subtotalCents >= tier.freeOverCents;
        const amount = isFree ? 0 : tier.rateCents;
        const option: Stripe.Checkout.SessionCreateParams.ShippingOption = {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount, currency: 'cad' },
            display_name: isFree ? `${tier.name} (Free)` : tier.name,
          },
        };
        if (tier.minDeliveryDays != null || tier.maxDeliveryDays != null) {
          option.shipping_rate_data!.delivery_estimate = {
            minimum: {
              unit: 'business_day',
              value: tier.minDeliveryDays ?? tier.maxDeliveryDays ?? 1,
            },
            maximum: {
              unit: 'business_day',
              value: tier.maxDeliveryDays ?? tier.minDeliveryDays ?? 7,
            },
          };
        }
        return option;
      });

    const automaticTaxEnabled = this.stripeConfig.automaticTaxEnabled;

    // Groups this charge with the per-brand transfers it will fund. The cart id
    // is not usable here — a cart is reused across orders, so its id would
    // collide between purchases.
    const transferGroup = randomUUID();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      // No transfer_data / on_behalf_of: a PaymentIntent carries at most one
      // destination, which cannot express a cart spanning two businesses. The
      // platform brand takes the whole charge and each other brand is paid by a
      // separate Transfer once the charge settles.
      payment_intent_data: { transfer_group: transferGroup },
      ...(user.stripeCustomerId
        ? {
            customer: user.stripeCustomerId,
            ...(automaticTaxEnabled
              ? {
                  // Required when automatic_tax + shipping_address_collection use a Customer
                  customer_update: { shipping: 'auto', address: 'auto' },
                }
              : {}),
          }
        : { customer_email: user.email }),
      ...(automaticTaxEnabled ? { automatic_tax: { enabled: true } } : {}),
      shipping_address_collection: { allowed_countries: ['CA'] },
      shipping_options: shippingOptions,
      allow_promotion_codes: true,
      metadata: {
        purpose: 'shop',
        cartId: cart.id,
        userId,
        transferGroup,
      },
      success_url: this.stripeConfig.successUrlShop,
      cancel_url: this.stripeConfig.cancelUrlShop,
    });

    if (!session.url) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create checkout session',
      });
    }

    return { url: session.url };
  }
}
