"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import {
  AuthFieldError,
  AuthFieldLabel,
  AuthFieldShell,
  AuthRequiredLabel,
} from "@/components/features/auth/components/auth-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  PHONE_TYPES,
  registerStep2Schema,
  type RegisterStep2Values,
} from "../schemas/register.schema";

const PHONE_TYPE_LABELS: Record<(typeof PHONE_TYPES)[number], string> = {
  mobile: "Mobile",
  home: "Home",
  work: "Work",
};

type RegisterStep2FormProps = {
  email: string;
  defaultValues?: Partial<RegisterStep2Values>;
  onBack: () => void;
  onContinue: (values: RegisterStep2Values) => void;
  error?: string | null;
};

function AuthSelectShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-[#185b50]"
        aria-hidden
      />
    </div>
  );
}

export function RegisterStep2Form({
  email,
  defaultValues,
  onBack,
  onContinue,
  error,
}: RegisterStep2FormProps) {
  const form = useForm<RegisterStep2Values>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      countryCode: "+1",
      phone: defaultValues?.phone ?? "",
      phoneType: defaultValues?.phoneType ?? "mobile",
    },
  });

  const {
    register,
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

      <div className="flex flex-col gap-3.5">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <AuthRequiredLabel htmlFor="firstName">First Name</AuthRequiredLabel>
            <AuthFieldShell>
              <Input
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Enter Full Name"
                className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
                {...register("firstName")}
              />
            </AuthFieldShell>
            <AuthFieldError message={errors.firstName?.message} />
          </div>

          <div className="flex flex-col gap-2">
            <AuthRequiredLabel htmlFor="lastName">Last Name</AuthRequiredLabel>
            <AuthFieldShell>
              <Input
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Enter Last Name"
                className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
                {...register("lastName")}
              />
            </AuthFieldShell>
            <AuthFieldError message={errors.lastName?.message} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <AuthFieldLabel htmlFor="email-display">Email</AuthFieldLabel>
          <AuthFieldShell>
            <Input
              id="email-display"
              type="email"
              value={email}
              readOnly
              tabIndex={-1}
              className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none focus-visible:ring-0 md:text-base"
            />
          </AuthFieldShell>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-2 sm:w-[200px]">
              <AuthRequiredLabel htmlFor="countryCode">Phone</AuthRequiredLabel>
              <AuthSelectShell>
                <AuthFieldShell className="px-4">
                  <span className="text-base" aria-hidden>
                    🇨🇦
                  </span>
                  <select
                    id="countryCode"
                    className="w-full appearance-none border-0 bg-transparent pr-6 text-base tracking-[0.01em] text-[#222] outline-none"
                    {...register("countryCode")}
                  >
                    <option value="+1">Canada (+1)</option>
                  </select>
                </AuthFieldShell>
              </AuthSelectShell>
            </div>

            <div className="min-w-0 flex-1">
              <AuthFieldShell className="sm:mt-0">
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="Enter Phone"
                  className="h-auto border-0 bg-transparent p-0 text-base tracking-[0.01em] text-[#222] shadow-none placeholder:text-[#222]/70 focus-visible:ring-0 md:text-base"
                  {...register("phone")}
                />
              </AuthFieldShell>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-[135px]">
              <AuthRequiredLabel htmlFor="phoneType">Phone Type</AuthRequiredLabel>
              <AuthSelectShell>
                <Controller
                  name="phoneType"
                  control={control}
                  render={({ field }) => (
                    <AuthFieldShell className="px-4">
                      <select
                        id="phoneType"
                        className="w-full appearance-none border-0 bg-transparent pr-6 text-base tracking-[0.01em] text-[#222] outline-none"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        {PHONE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {PHONE_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </AuthFieldShell>
                  )}
                />
              </AuthSelectShell>
            </div>
          </div>
          <AuthFieldError message={errors.phone?.message} />
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
