export const MEMBERSHIP_PLAN_IDS = ['essential', 'enhanced', 'elite'] as const;

export type MembershipPlanId = (typeof MEMBERSHIP_PLAN_IDS)[number];

export type MembershipPlanDefinition = {
  id: MembershipPlanId;
  name: string;
  description: string;
  priceCents: number;
};

// Canonical plan naming/pricing — matches the plans presented at registration
// (components/features/auth/utils/register-membership-plans.ts in the customer app).
export const MEMBERSHIP_PLAN_CATALOG: Record<
  MembershipPlanId,
  MembershipPlanDefinition
> = {
  essential: {
    id: 'essential',
    name: 'Essential',
    description: 'Start your wellness journey with member-only savings.',
    priceCents: 3999,
  },
  enhanced: {
    id: 'enhanced',
    name: 'Enhanced',
    description: 'More treatments, more savings, and added wellness perks.',
    priceCents: 5999,
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    description: 'Premium benefits with maximum savings and priority access.',
    priceCents: 6999,
  },
};
