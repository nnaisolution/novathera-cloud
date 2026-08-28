import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeConfigService } from '../../../config/stripe/config.service';

type SyncProductInput = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  currency: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
  metadata?: Record<string, string>;
};

export type SyncProductResult = {
  stripeProductId: string;
  stripePriceId: string;
};

@Injectable()
export class StripeCatalogService {
  private readonly logger = new Logger(StripeCatalogService.name);
  private readonly client: Stripe | null;

  constructor(private readonly stripeConfig: StripeConfigService) {
    this.client = stripeConfig.secretKey
      ? new Stripe(stripeConfig.secretKey)
      : null;
  }

  get stripe(): Stripe | null {
    return this.client;
  }

  get isEnabled(): boolean {
    return this.client !== null;
  }

  async syncProduct(
    input: SyncProductInput,
  ): Promise<SyncProductResult | null> {
    if (!this.client) return null;

    try {
      const currency = input.currency.toLowerCase();
      let productId = input.stripeProductId;

      if (!productId) {
        const product = await this.client.products.create({
          name: input.name,
          description: input.description ?? undefined,
          metadata: {
            internalId: input.id,
            ...input.metadata,
          },
        });
        productId = product.id;
      } else {
        await this.client.products.update(productId, {
          name: input.name,
          description: input.description ?? undefined,
          metadata: {
            internalId: input.id,
            ...input.metadata,
          },
        });
      }

      let priceId = input.stripePriceId;
      let needsNewPrice = !priceId;

      if (priceId) {
        const existing = await this.client.prices.retrieve(priceId);
        if (
          existing.unit_amount !== input.priceCents ||
          existing.currency !== currency ||
          existing.product !== productId
        ) {
          needsNewPrice = true;
          await this.client.prices.update(priceId, { active: false });
        }
      }

      if (needsNewPrice) {
        const price = await this.client.prices.create({
          product: productId,
          unit_amount: input.priceCents,
          currency,
          tax_behavior: 'exclusive',
        });
        priceId = price.id;
      }

      return {
        stripeProductId: productId,
        stripePriceId: priceId!,
      };
    } catch (error) {
      this.logger.warn(
        `Stripe product sync failed for ${input.id}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}
