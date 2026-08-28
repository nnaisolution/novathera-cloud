export type MembershipPlan = {
  id: "essential" | "enhanced" | "elite";
  name: string;
  description: string;
  priceCents: number;
};

export type MembershipStats = {
  visitsThisYear: number;
  savingsCents: number;
  rewardPoints: number;
};

export type CurrentMembership =
  | { hasActiveSubscription: false; plans: MembershipPlan[] }
  | {
      hasActiveSubscription: true;
      plan: MembershipPlan;
      status: string;
      periodEnd: Date | string | null;
      cancelAtPeriodEnd: boolean;
      stats: MembershipStats;
    };
