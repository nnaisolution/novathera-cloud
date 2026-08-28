import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { PaymentMethodsRepository } from './payment-methods.repository';

export type PaymentMethodSummary = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly repository: PaymentMethodsRepository,
    private readonly stripeCatalog: StripeCatalogService,
  ) {}

  private get stripe() {
    if (!this.stripeCatalog.stripe) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Payments are not configured yet.',
      });
    }
    return this.stripeCatalog.stripe;
  }

  /** Returns the user's Stripe customer id, creating one if it doesn't exist yet. */
  private async ensureStripeCustomer(userId: string): Promise<string> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId },
    });
    await this.repository.setStripeCustomerId(userId, customer.id);
    return customer.id;
  }

  private async assertOwnsPaymentMethod(
    userId: string,
    paymentMethodId: string,
  ) {
    const user = await this.repository.findUserById(userId);
    const paymentMethod =
      await this.stripe.paymentMethods.retrieve(paymentMethodId);
    if (
      !user?.stripeCustomerId ||
      paymentMethod.customer !== user.stripeCustomerId
    ) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Payment method not found',
      });
    }
  }

  async listForCustomer(userId: string): Promise<PaymentMethodSummary[]> {
    const user = await this.repository.findUserById(userId);
    if (!user?.stripeCustomerId) return [];

    const [methods, customer] = await Promise.all([
      this.stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      }),
      this.stripe.customers.retrieve(user.stripeCustomerId),
    ]);

    const defaultId =
      !customer.deleted && typeof customer.invoice_settings?.default_payment_method === 'string'
        ? customer.invoice_settings.default_payment_method
        : null;

    return methods.data
      .filter((method) => method.card)
      .map((method) => ({
        id: method.id,
        brand: method.card!.brand,
        last4: method.card!.last4,
        expMonth: method.card!.exp_month,
        expYear: method.card!.exp_year,
        isDefault: method.id === defaultId,
      }));
  }

  async createSetupIntent(userId: string) {
    const customerId = await this.ensureStripeCustomer(userId);
    // No payment_method_types — omitting it enables Stripe's dynamic payment
    // methods, letting the Dashboard control what's offered without a redeploy.
    const setupIntent = await this.stripe.setupIntents.create({
      customer: customerId,
    });
    return { clientSecret: setupIntent.client_secret! };
  }

  async detach(userId: string, paymentMethodId: string) {
    await this.assertOwnsPaymentMethod(userId, paymentMethodId);
    await this.stripe.paymentMethods.detach(paymentMethodId);
    return { success: true };
  }

  async setDefault(userId: string, paymentMethodId: string) {
    await this.assertOwnsPaymentMethod(userId, paymentMethodId);
    const user = await this.repository.findUserById(userId);
    await this.stripe.customers.update(user!.stripeCustomerId!, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
    return { success: true };
  }
}
