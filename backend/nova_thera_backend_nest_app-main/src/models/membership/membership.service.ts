import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { AuthInstance } from '../../authentication/auth.factory';
import { StripeConfigService } from '../../config/stripe/config.service';
import { MembershipRepository } from './membership.repository';
import {
  MEMBERSHIP_PLAN_CATALOG,
  MEMBERSHIP_PLAN_IDS,
  type MembershipPlanId,
} from './membership-plans';

@Injectable()
export class MembershipService {
  constructor(
    private readonly repository: MembershipRepository,
    private readonly authService: AuthService<AuthInstance>,
    private readonly stripeConfig: StripeConfigService,
  ) {}

  private async computeStats(userId: string) {
    const [bookings, orderTotalCents] = await Promise.all([
      this.repository.findBookingsThisYear(userId),
      this.repository.sumPaidOrderTotalCentsThisYear(userId),
    ]);

    const visitsThisYear = bookings.length;
    const savingsCents = bookings.reduce((sum, booking) => {
      const standardPriceCents =
        booking.service?.standardPriceCents ?? booking.priceCents;
      return sum + Math.max(0, standardPriceCents - booking.priceCents);
    }, 0);
    const bookingSpendCents = bookings.reduce(
      (sum, booking) => sum + booking.priceCents,
      0,
    );
    // 1 reward point per dollar spent — computed on read, no persisted ledger.
    const rewardPoints = Math.floor(
      (bookingSpendCents + orderTotalCents) / 100,
    );

    return { visitsThisYear, savingsCents, rewardPoints };
  }

  async getCurrentForUser(userId: string) {
    const [subscription, stats] = await Promise.all([
      this.repository.findCurrentForUser(userId),
      this.computeStats(userId),
    ]);

    const plans = MEMBERSHIP_PLAN_IDS.map((id) => MEMBERSHIP_PLAN_CATALOG[id]);

    if (!subscription) {
      return { hasActiveSubscription: false as const, plans };
    }

    const planId = MEMBERSHIP_PLAN_IDS.find(
      (id) => MEMBERSHIP_PLAN_CATALOG[id].name === subscription.plan,
    );
    const plan = planId ? MEMBERSHIP_PLAN_CATALOG[planId] : null;

    return {
      hasActiveSubscription: true as const,
      plan: plan ?? {
        id: subscription.plan,
        name: subscription.plan,
        description: '',
        priceCents: 0,
      },
      status: subscription.status,
      periodEnd: subscription.periodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
      stats,
    };
  }

  async upgradePlan(
    userId: string,
    planId: MembershipPlanId,
    headers: Headers,
  ) {
    const result = await this.authService.api.upgradeSubscription({
      body: {
        plan: MEMBERSHIP_PLAN_CATALOG[planId].name,
        referenceId: userId,
        successUrl: this.stripeConfig.membershipSuccessUrl,
        cancelUrl: this.stripeConfig.membershipCancelUrl,
      },
      headers,
    });
    return { url: result.url ?? null };
  }

  async managePlan(userId: string, headers: Headers) {
    const result = await this.authService.api.createBillingPortal({
      body: {
        referenceId: userId,
        returnUrl: this.stripeConfig.membershipPortalReturnUrl,
      },
      headers,
    });
    return { url: result.url };
  }
}
