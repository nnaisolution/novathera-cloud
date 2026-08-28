"use client";

import { Award, Check } from "lucide-react";
import { toast } from "sonner";

import { useMembership, useMembershipActions } from "../hooks/use-membership";
import type { MembershipPlan } from "../types";

const BENEFITS = [
  {
    title: "Priority booking",
    description: "Reserve appointments up to 60 days ahead.",
  },
  {
    title: "Member pricing",
    description: "Save automatically on every visit.",
  },
  {
    title: "Reward points",
    description: "Earn points on every dollar you spend.",
  },
];

function redirectTo(url: string) {
  window.location.href = url;
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
  });
}

function formatDate(value: Date | string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 rounded-2xl bg-white/10 p-5">
      <p className="text-xs tracking-[1.2px] text-white/50 uppercase">
        {label}
      </p>
      <p className="font-serif text-2xl text-white">{value}</p>
    </div>
  );
}

function Benefits() {
  return (
    <div
      id="membership-benefits"
      className="grid w-full grid-cols-1 gap-[30px] sm:grid-cols-3"
    >
      {BENEFITS.map((benefit) => (
        <div
          key={benefit.title}
          className="flex flex-col items-start gap-[30px] rounded-[20px] bg-white p-[30px]"
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-[#f3f3f3]">
            <Check className="size-5 text-[#bf913d]" aria-hidden />
          </div>
          <div className="flex flex-col items-start gap-2.5">
            <p className="font-serif text-xl text-[#185b50]">
              {benefit.title}
            </p>
            <p className="text-base text-[#546256]">{benefit.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  onSubscribe,
  isSubscribing,
}: {
  plan: MembershipPlan;
  onSubscribe: () => void;
  isSubscribing: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-5 rounded-[20px] bg-white p-[30px]">
      <p className="font-serif text-xl text-[#185b50]">{plan.name}</p>
      <p className="text-base text-[#546256]">{plan.description}</p>
      <p className="font-serif text-2xl text-[#185b50]">
        {formatCents(plan.priceCents)}
        <span className="text-base text-[#546256]"> / month</span>
      </p>
      <button
        type="button"
        onClick={onSubscribe}
        disabled={isSubscribing}
        className="h-[50px] w-full rounded-2xl bg-[#185b50] text-base text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isSubscribing ? "Redirecting..." : "Subscribe"}
      </button>
    </div>
  );
}

export function MembershipView() {
  const { data, isLoading } = useMembership();
  const { upgradePlan, isUpgrading, managePlan, isManaging } =
    useMembershipActions();

  async function handleSubscribe(planId: MembershipPlan["id"]) {
    const { url } = await upgradePlan(planId);
    if (!url) {
      toast.error("Unable to start checkout. Please try again.");
      return;
    }
    redirectTo(url);
  }

  async function handleManagePlan() {
    const { url } = await managePlan();
    if (!url) {
      toast.error("Unable to open plan management. Please try again.");
      return;
    }
    redirectTo(url);
  }

  return (
    <div className="flex w-full flex-col items-start gap-10">
      <div className="flex flex-col items-start gap-2.5">
        <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
          Memberships
        </h1>
        <p className="text-base text-[#546256]">Your Nova Thera plan</p>
      </div>

      {isLoading ? (
        <div className="h-[320px] w-full animate-pulse rounded-[20px] bg-[#f3f3f3]" />
      ) : data?.hasActiveSubscription ? (
        <>
          <div className="flex w-full flex-col items-start gap-10 rounded-[20px] bg-[#185b50] p-[30px]">
            <span className="flex items-center gap-2.5 text-base text-[#bf913d]">
              <Award className="size-5" aria-hidden />
              {data.plan.name} Tier
            </span>

            <div className="flex flex-col items-start gap-2.5">
              <p className="font-serif text-[32px] text-white">
                {"You're on the "}
                <span className="text-[#bf913d]">{data.plan.name}</span>
                {" plan"}
              </p>
              <p className="max-w-2xl text-base text-white/90">
                {data.plan.description}
                {formatDate(data.periodEnd)
                  ? ` ${data.cancelAtPeriodEnd ? "Ends" : "Renews"} ${formatDate(data.periodEnd)}.`
                  : ""}
              </p>
            </div>

            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
              <Stat
                label="visits this year"
                value={String(data.stats.visitsThisYear)}
              />
              <Stat
                label="savings"
                value={formatCents(data.stats.savingsCents)}
              />
              <Stat
                label="reward points"
                value={data.stats.rewardPoints.toLocaleString()}
              />
            </div>

            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => void handleManagePlan()}
                disabled={isManaging}
                className="h-[60px] rounded-2xl bg-gradient-to-r from-[#f3b94c] via-[#d68900] to-[#f3b94c] px-7 text-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isManaging ? "Opening..." : "Manage Plan"}
              </button>
              <a
                href="#membership-benefits"
                className="flex h-[60px] items-center justify-center rounded-2xl bg-white/20 px-[30px] text-base text-white transition-opacity hover:opacity-90"
              >
                View Benefits
              </a>
            </div>
          </div>

          <Benefits />
        </>
      ) : (
        <>
          <div className="flex w-full flex-col items-start gap-4 rounded-[20px] bg-[#185b50] p-[30px]">
            <p className="font-serif text-[32px] text-white">
              No active membership yet
            </p>
            <p className="max-w-2xl text-base text-white/90">
              Subscribe to a plan to unlock member pricing, priority booking,
              and reward points.
            </p>
          </div>

          {data ? (
            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
              {data.plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSubscribe={() => void handleSubscribe(plan.id)}
                  isSubscribing={isUpgrading}
                />
              ))}
            </div>
          ) : null}

          <Benefits />
        </>
      )}
    </div>
  );
}
