"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  AuthFieldError,
  AuthFieldShell,
  AuthRequiredLabel,
} from "@/components/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import {
  REFERRAL_SOURCE_LABELS,
  REFERRAL_SOURCES,
  registerStep3Schema,
  type RegisterStep3Values,
} from "../schemas/register.schema";

type RegisterStep3FormProps = {
  defaultValues?: Partial<RegisterStep3Values>;
  onBack: () => void;
  onContinue: (values: RegisterStep3Values) => void;
  error?: string | null;
};

export function RegisterStep3Form({
  defaultValues,
  onBack,
  onContinue,
  error,
}: RegisterStep3FormProps) {
  const form = useForm<RegisterStep3Values>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: {
      referralSource: defaultValues?.referralSource,
      marketingOptIn: defaultValues?.marketingOptIn ?? false,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <form
      onSubmit={handleSubmit(onContinue)}
      className="flex w-full flex-col gap-5"
    >
      {error ? (
        <p className="text-destructive rounded-2xl bg-red-50 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <AuthRequiredLabel htmlFor="referralSource">
            How did you hear about us?
          </AuthRequiredLabel>
          <div className="relative">
            <Controller
              name="referralSource"
              control={control}
              render={({ field }) => (
                <AuthFieldShell className="justify-between pr-4">
                  <select
                    id="referralSource"
                    className={cn(
                      "w-full appearance-none border-0 bg-transparent text-base tracking-[0.01em] outline-none",
                      field.value ? "text-[#222]" : "text-[#222]/70",
                    )}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      field.onChange(value === "" ? undefined : value);
                    }}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {REFERRAL_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {REFERRAL_SOURCE_LABELS[source]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none size-5 shrink-0 text-[#185b50]"
                    aria-hidden
                  />
                </AuthFieldShell>
              )}
            />
          </div>
          <AuthFieldError message={errors.referralSource?.message} />
        </div>

        <div className="flex flex-col gap-5">
          <p className="text-base font-semibold tracking-[0.01em] text-[#185b50]">
            Yes, I would like to receive news and special promotions by email.
          </p>
          <Controller
            name="marketingOptIn"
            control={control}
            render={({ field }) => (
              <label className="flex cursor-pointer items-center gap-2.5">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) =>
                    field.onChange(checked === true)
                  }
                  className="size-6 rounded-[6px] border-[1.5px] border-[#185b50]/50 data-checked:border-[#185b50] data-checked:bg-[#185b50]"
                />
                <span className="text-base tracking-[0.01em] text-[#222]">
                  Yes, sign me up
                </span>
              </label>
            )}
          />
        </div>
      </div>

      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="h-[52px] flex-1 rounded-2xl bg-[#185b50]/20 px-[30px] text-base font-normal text-[#185b50] hover:bg-[#185b50]/25 hover:text-[#185b50]"
        >
          <ArrowLeft className="size-5" aria-hidden />
          Back
        </Button>
        <Button
          type="submit"
          className="h-[52px] flex-1 rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
