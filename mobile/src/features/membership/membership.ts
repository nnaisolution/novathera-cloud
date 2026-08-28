import type { inferRouterOutputs } from "@trpc/server";

import type { NestAppRouter } from "../../api/nest-client";
import type { ChipTone } from "../../components/Chip";

type NestOutputs = inferRouterOutputs<NestAppRouter>;

/**
 * `membership.myGetCurrent` is a discriminated union on `hasActiveSubscription`.
 * Both halves are extracted here so screens narrow on the flag instead of
 * reaching for optional properties that only exist on one branch.
 */
export type MembershipSnapshot = NestOutputs["membership"]["myGetCurrent"];
export type ActiveMembership = Extract<MembershipSnapshot, { hasActiveSubscription: true }>;
export type InactiveMembership = Extract<MembershipSnapshot, { hasActiveSubscription: false }>;
export type MembershipPlan = InactiveMembership["plans"][number];
export type MembershipPlanId = MembershipPlan["id"];

/**
 * Stripe subscription statuses. `status` is typed as a bare `string`, so this
 * maps the ones Stripe documents and falls through gracefully for anything new.
 */
const STATUS_COPY: Record<string, { label: string; tone: ChipTone }> = {
  active: { label: "Active", tone: "positive" },
  trialing: { label: "Trial", tone: "positive" },
  past_due: { label: "Payment overdue", tone: "attention" },
  unpaid: { label: "Unpaid", tone: "critical" },
  incomplete: { label: "Setup incomplete", tone: "attention" },
  incomplete_expired: { label: "Setup expired", tone: "critical" },
  canceled: { label: "Cancelled", tone: "critical" },
  paused: { label: "Paused", tone: "neutral" },
};

export function membershipStatusChip(status: string): { label: string; tone: ChipTone } {
  const known = STATUS_COPY[status];
  if (known) return known;

  // Unknown status: show it rather than hide it, but do not colour it as though
  // its meaning were understood.
  const label = status.replace(/_/g, " ");
  return { label: label.charAt(0).toUpperCase() + label.slice(1), tone: "neutral" };
}

/**
 * Renewal dates are calendar days, not appointments — the exact hour carries no
 * meaning for the patient — so unlike bookings these are shown in the device's
 * own zone rather than pinned to a clinic.
 */
export function formatPeriodEnd(periodEnd: Date | null): string | null {
  if (periodEnd === null || Number.isNaN(periodEnd.getTime())) return null;
  return periodEnd.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const MEMBERSHIP_BENEFITS: readonly { title: string; body: string }[] = [
  { title: "Priority booking", body: "Reserve appointments up to 60 days ahead." },
  { title: "Member pricing", body: "Discounts applied automatically on every visit." },
  { title: "Reward points", body: "Earn points on everything you spend at the clinic." },
];
