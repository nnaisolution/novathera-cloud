export const REGISTER_MEMBERSHIP_PLANS = [
  {
    id: "essential",
    name: "Essential",
    description: "Start your wellness journey with member-only savings.",
    price: "$39.99",
    popular: false,
  },
  {
    id: "enhanced",
    name: "Enhanced",
    description: "More treatments, more savings, and added wellness perks.",
    price: "$59.99",
    popular: true,
  },
  {
    id: "elite",
    name: "Elite",
    description: "Premium benefits with maximum savings and priority access.",
    price: "$69.99",
    popular: false,
  },
] as const;

export type RegisterMembershipPlanId =
  (typeof REGISTER_MEMBERSHIP_PLANS)[number]["id"];
