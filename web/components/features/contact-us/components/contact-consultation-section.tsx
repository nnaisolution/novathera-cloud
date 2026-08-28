"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { contactConsultationCopy } from "@/components/features/contact-us/contact-us-data";
import { useSubmitContact } from "@/components/features/contact-us/hooks/use-submit-contact";
import {
  contactServiceOptions,
  submitContactInput,
  type SubmitContactInput,
} from "@/components/features/contact-us/schemas/submit-contact";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs tracking-[1.8px] text-[#546256] uppercase"
    >
      {children}
    </label>
  );
}

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
        "flex w-full rounded-3xl border border-[#d8d8cd] bg-[rgba(229,235,216,0.4)] px-[17px] py-3.5",
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

type ContactConsultationSectionProps = {
  className?: string;
};

export function ContactConsultationSection({
  className,
}: ContactConsultationSectionProps) {
  const submitContact = useSubmitContact();

  const form = useForm<SubmitContactInput>({
    resolver: zodResolver(submitContactInput),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: undefined,
      message: "",
      termsAccepted: true,
      website: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(values: SubmitContactInput) {
    const phone = values.phone?.trim();

    submitContact.mutate(
      {
        ...values,
        phone: phone || undefined,
        termsAccepted: true,
        website: values.website ?? "",
      },
      {
        onSuccess: () => {
          toast.success("Request sent", {
            description: "Our team will reach out within 24 hours.",
          });
          form.reset({
            name: "",
            email: "",
            phone: "",
            service: undefined,
            message: "",
            termsAccepted: true,
            website: "",
          });
        },
        onError: (error) => {
          toast.error("Could not send request", {
            description: error.message || "Please try again in a moment.",
          });
        },
      },
    );
  }

  return (
    <section
      className={cn(
        "bg-[rgba(229,235,216,0.4)] px-6 py-20 lg:px-[200px] lg:py-28",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 lg:flex-row lg:gap-16">
        <div className="flex flex-1 flex-col gap-6">
          <p className="text-base tracking-[3px] text-[#d79628] uppercase">
            {contactConsultationCopy.eyebrow}
          </p>
          <h2 className="font-display text-4xl tracking-[-0.6px] text-[#0c1f13] sm:text-[48px] sm:leading-[1.25]">
            {contactConsultationCopy.headlineBefore}
            <span className="text-[#d79628]">
              {contactConsultationCopy.headlineAccent}
            </span>
            {contactConsultationCopy.headlineAfter}
          </h2>
          <p className="max-w-[448px] text-base leading-[1.5] text-[#546256]">
            {contactConsultationCopy.body}
          </p>
          <ul className="flex flex-col gap-4 pt-4">
            {contactConsultationCopy.benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[rgba(215,150,40,0.15)] text-lg text-[#d79628]">
                  ✓
                </span>
                <span className="text-base text-[#0c1f13]">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex-1 rounded-[28px] border border-[#d8d8cd] bg-[#faf7ee] p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1)] lg:p-10">
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div
              className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
              aria-hidden
            >
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("website")}
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="contact-name">Name</FieldLabel>
                <FieldShell>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your full name"
                    className="w-full bg-transparent text-sm text-[#0c1f13] outline-none placeholder:text-[rgba(12,31,19,0.5)]"
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    {...register("name")}
                  />
                </FieldShell>
                <FieldError message={errors.name?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                <FieldShell>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm text-[#0c1f13] outline-none placeholder:text-[rgba(12,31,19,0.5)]"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </FieldShell>
                <FieldError message={errors.email?.message} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="contact-phone">Phone</FieldLabel>
                <FieldShell>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-transparent text-sm text-[#0c1f13] outline-none placeholder:text-[rgba(12,31,19,0.5)]"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    {...register("phone")}
                  />
                </FieldShell>
                <FieldError message={errors.phone?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <FieldLabel htmlFor="contact-service">Service interest</FieldLabel>
                <FieldShell className="relative items-center py-[13px]">
                  <select
                    id="contact-service"
                    className="w-full appearance-none bg-transparent pr-8 text-sm text-[#0c1f13] outline-none"
                    defaultValue=""
                    aria-invalid={!!errors.service}
                    {...register("service")}
                  >
                    <option value="" disabled>
                      Select a service
                    </option>
                    {contactServiceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 size-4 text-[#546256]"
                    aria-hidden
                  />
                </FieldShell>
                <FieldError message={errors.service?.message} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <FieldShell className="min-h-[120px] items-start">
                <textarea
                  id="contact-message"
                  rows={4}
                  placeholder="Tell us about your goals or any questions you have..."
                  className="min-h-[96px] w-full resize-none bg-transparent text-sm text-[#0c1f13] outline-none placeholder:text-[rgba(12,31,19,0.5)]"
                  aria-invalid={!!errors.message}
                  {...register("message")}
                />
              </FieldShell>
              <FieldError message={errors.message?.message} />
            </div>

            <Button
              type="submit"
              disabled={submitContact.isPending}
              className="mt-1 h-auto w-full rounded-full bg-[linear-gradient(136deg,#f3b94c_0%,#e0991a_25%,#d68900_33%,#cb7a00_50%,#d68900_67%,#e0991a_75%,#f3b94c_100%)] px-7 py-3.5 text-base font-semibold text-[#1b0e04] shadow-[0px_10px_30px_-10px_rgba(215,150,40,0.55)] hover:opacity-90"
            >
              {submitContact.isPending
                ? contactConsultationCopy.submitting
                : contactConsultationCopy.submit}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
