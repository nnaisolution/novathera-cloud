"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import {
  bookingDetailsInput,
  type BookingDetailsInput,
} from "@/components/features/booking/schemas/booking-details";
import { bookingRoutes } from "@/components/features/booking/utils/booking-routes";
import { siteNavigation } from "@/components/shared/site-navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FieldShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full rounded-[16px] bg-[#f3f3f3] px-5 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="text-destructive text-sm">{message}</p>;
}

export function BookingDetailsForm() {
  const router = useRouter();
  const { state, isHydrated, setDetails } = useBookingWizard();

  const form = useForm<BookingDetailsInput>({
    resolver: zodResolver(bookingDetailsInput),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      termsAccepted: true,
    },
  });

  useEffect(() => {
    if (!isHydrated || !state.details) return;
    form.reset(state.details);
  }, [form, isHydrated, state.details]);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  function onSubmit(values: BookingDetailsInput) {
    setDetails(values);
    router.push(bookingRoutes.clinic);
  }

  return (
    <form
      className="flex flex-col lg:h-full lg:min-h-0 justify-between gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="flex w-full flex-col gap-5 lg:min-h-0 lg:gap-6 lg:overflow-y-auto">
        <BookingBackButton />

        <BookingStepHeader
          title="Enter your details"
          description="You can join with your email address or mobile number and get started."
        />

        <div className="flex w-full flex-col gap-3 lg:gap-4">
          <div className="flex flex-col gap-1">
            <FieldShell className="h-12 items-center gap-2.5 lg:h-[60px]">
              <User
                className="size-6 shrink-0 text-[#222]"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="text"
                placeholder="Enter your name"
                className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] text-[#222] outline-none placeholder:text-[#222]"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
            </FieldShell>
            <FieldError message={errors.name?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <FieldShell className="h-12 items-center gap-2.5 lg:h-[60px]">
              <Mail
                className="size-6 shrink-0 text-[#222]"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="email"
                placeholder="Enter your email address"
                className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] text-[#222] outline-none placeholder:text-[#222]"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FieldShell>
            <FieldError message={errors.email?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <FieldShell className="h-12 items-center gap-2.5 lg:h-[60px]">
              <Phone
                className="size-6 shrink-0 text-[#222]"
                strokeWidth={1.5}
                aria-hidden
              />
              <input
                type="tel"
                placeholder="Enter your contact number"
                className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] text-[#222] outline-none placeholder:text-[#222]"
                autoComplete="tel"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </FieldShell>
            <FieldError message={errors.phone?.message} />
          </div>

          <div className="flex flex-col gap-1">
            <Controller
              name="termsAccepted"
              control={control}
              render={({ field }) => (
                <label className="flex cursor-pointer items-center gap-2.5">
                  <span className="relative flex size-6 shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-[#185b50] bg-[#185b50]">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={field.value === true}
                      onChange={(event) =>
                        field.onChange(event.target.checked ? true : false)
                      }
                    />
                    <Check
                      className={cn(
                        "size-3.5 text-white",
                        field.value ? "opacity-100" : "opacity-0",
                      )}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </span>
                  <span className="text-base leading-[1.5] text-[#222]">
                    I have read &amp; agreed to the T&amp;C and the privacy
                    policy
                  </span>
                </label>
              )}
            />
            <FieldError message={errors.termsAccepted?.message} />
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-2 pt-2">
        <p className="text-center text-xs leading-[1.5] text-[#666] lg:text-sm">
          By proceeding with this form, you agree to our{" "}
          <a
            href={siteNavigation.privacyPolicy}
            className="text-[#666] underline-offset-2 hover:underline"
          >
            Privacy policy
          </a>{" "}
          &amp;{" "}
          <a
            href={siteNavigation.terms}
            className="text-[#666] underline-offset-2 hover:underline"
          >
            Terms of service
          </a>
          , granting us permission to use your personal information as specified
          in the privacy policy.
        </p>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-[16px] bg-[#185b50] px-[30px] py-3 text-base font-normal text-white hover:bg-[#185b50]/90 lg:h-[60px] lg:text-lg"
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
