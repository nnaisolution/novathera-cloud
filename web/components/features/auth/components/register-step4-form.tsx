"use client";

import { Flame } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { RegisterStep4Values } from "../schemas/register.schema";
import {
  REGISTER_MEMBERSHIP_PLANS,
  type RegisterMembershipPlanId,
} from "../utils/register-membership-plans";

type RegisterStep4FormProps = {
  defaultValues?: Partial<RegisterStep4Values>;
  onContinue: (values: RegisterStep4Values) => void;
  onSkip: () => void;
  isPending?: boolean;
  error?: string | null;
};

export function RegisterStep4Form({
  defaultValues,
  onContinue,
  onSkip,
  isPending = false,
  error,
}: RegisterStep4FormProps) {
  const [selectedPlan, setSelectedPlan] = useState<RegisterMembershipPlanId>(
    defaultValues?.membershipPlan ?? "enhanced",
  );

  const handleContinue = () => {
    onContinue({ membershipPlan: selectedPlan });
  };

  return (
    <div className="flex w-full flex-col gap-5">
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4">
        {REGISTER_MEMBERSHIP_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "flex min-h-[110px] w-full items-center justify-between rounded-2xl bg-[#f2f2e5] px-5 py-4 text-left transition-colors sm:min-h-[120px] sm:px-7 sm:py-5",
                isSelected && "border-[1.5px] border-[#185b50]",
              )}
            >
              <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
                {plan.popular ? (
                  <span className="inline-flex w-fit items-center gap-1 rounded-md bg-[#185b50] px-1.5 py-1 text-xs text-white">
                    <Flame className="size-3" aria-hidden />
                    Popular
                  </span>
                ) : null}
                <div className="flex flex-col gap-1">
                  <p className="font-display text-xl tracking-[0.01em] text-[#185b50] sm:text-2xl">
                    {plan.name}
                  </p>
                  <p className="text-sm tracking-[0.01em] text-[#222] sm:text-base">
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="ml-4 shrink-0 text-center">
                <p className="font-display text-2xl tracking-[0.01em] text-[#185b50] sm:text-4xl">
                  {plan.price}
                </p>
                <p className="text-sm tracking-[0.01em] text-[#222] sm:text-base">
                  per month
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          type="button"
          disabled={isPending}
          onClick={handleContinue}
          className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
        >
          {isPending ? "Creating account..." : "Continue with selected membership"}
        </Button>

        <button
          type="button"
          disabled={isPending}
          onClick={onSkip}
          className="text-base tracking-[0.01em] text-[#222] underline underline-offset-2 hover:text-[#185b50] disabled:opacity-50"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
