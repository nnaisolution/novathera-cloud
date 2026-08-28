import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeConfigService } from '../../../config/stripe/config.service';
import { StripeCatalogService } from './stripe-catalog.service';

export type ConnectAccountStatus = {
  stripeAccountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsDue: string[];
  disabledReason: string | null;
};

/**
 * Stripe Connect operations for the non-platform brands.
 *
 * The storefront charges the platform account and then transfers each other
 * brand's share to its connected account ("separate charges and transfers").
 * A single PaymentIntent can only carry one `transfer_data.destination`, so
 * destination charges cannot express a cart that mixes brands — this is the
 * only pattern that keeps a mixed cart as one payment under one brand.
 *
 * Connected accounts therefore only need the `transfers` capability; they never
 * process a card themselves.
 */
@Injectable()
export class StripeConnectService {
  private readonly logger = new Logger(StripeConnectService.name);

  constructor(
    private readonly catalog: StripeCatalogService,
    private readonly config: StripeConfigService,
  ) {}

  get isEnabled(): boolean {
    return this.catalog.isEnabled;
  }

  private requireClient(): Stripe {
    const client = this.catalog.stripe;
    if (!client) {
      throw new Error('Stripe is not configured (STRIPE_SECRET_KEY is unset)');
    }
    return client;
  }

  /**
   * Creates the connected account for a brand. Requests `transfers` only —
   * asking for `card_payments` would drag the brand through full payment-
   * processing onboarding it does not need.
   */
  async createConnectedAccount(input: {
    brandId: string;
    brandName: string;
    email?: string | null;
  }): Promise<string> {
    const stripe = this.requireClient();

    const account = await stripe.accounts.create(
      {
        type: 'express',
        country: this.config.connectCountry,
        email: input.email ?? undefined,
        capabilities: { transfers: { requested: true } },
        business_profile: { name: input.brandName },
        metadata: { brandId: input.brandId, brandName: input.brandName },
      },
      { idempotencyKey: `connect-account:${input.brandId}` },
    );

    this.logger.log(
      `Created connected account ${account.id} for brand ${input.brandId}`,
    );
    return account.id;
  }

  /** Fresh onboarding/update link. These expire quickly, so mint one per click. */
  async createAccountLink(
    stripeAccountId: string,
    type: 'account_onboarding' | 'account_update' = 'account_onboarding',
  ): Promise<string> {
    const stripe = this.requireClient();

    const link = await stripe.accountLinks.create({
      account: stripeAccountId,
      type,
      refresh_url: this.config.connectRefreshUrl,
      return_url: this.config.connectReturnUrl,
    });

    return link.url;
  }

  /**
   * Pulls live onboarding state. Polled from the admin UI on demand rather than
   * consumed via `account.updated`: that is a Connect webhook, which arrives
   * with a different signing secret than the single one the Better Auth Stripe
   * plugin verifies against. With only a couple of connected accounts, polling
   * avoids standing up a second webhook endpoint for no real benefit.
   */
  async getAccountStatus(
    stripeAccountId: string,
  ): Promise<ConnectAccountStatus> {
    const stripe = this.requireClient();
    const account = await stripe.accounts.retrieve(stripeAccountId);

    return {
      stripeAccountId: account.id,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      requirementsDue: account.requirements?.currently_due ?? [],
      disabledReason: account.requirements?.disabled_reason ?? null,
    };
  }

  /**
   * Moves one brand's share of a settled charge to its connected account.
   *
   * `source_transaction` ties the transfer to the originating charge, so it
   * settles when that charge settles instead of failing against an empty
   * platform balance.
   *
   * The idempotency key matters: `handleEvent` records the dedupe row only
   * after the handler finishes, so a Stripe retry that lands while the first
   * delivery is still in flight would otherwise transfer twice.
   */
  async createTransfer(input: {
    amountCents: number;
    currency: string;
    destinationAccountId: string;
    sourceChargeId: string;
    transferGroup: string;
    idempotencyKey: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Transfer> {
    const stripe = this.requireClient();

    return stripe.transfers.create(
      {
        amount: input.amountCents,
        currency: input.currency.toLowerCase(),
        destination: input.destinationAccountId,
        source_transaction: input.sourceChargeId,
        transfer_group: input.transferGroup,
        metadata: input.metadata,
      },
      { idempotencyKey: input.idempotencyKey },
    );
  }

  /**
   * Claws money back out of a connected account after a refund or a lost
   * dispute. `reverse_transfer` on the refund only works for destination
   * charges — with separate transfers each one must be reversed explicitly.
   */
  async reverseTransfer(input: {
    transferId: string;
    amountCents: number;
    idempotencyKey: string;
    metadata?: Record<string, string>;
  }): Promise<Stripe.TransferReversal> {
    const stripe = this.requireClient();

    return stripe.transfers.createReversal(
      input.transferId,
      { amount: input.amountCents, metadata: input.metadata },
      { idempotencyKey: input.idempotencyKey },
    );
  }
}
