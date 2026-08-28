"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useSubmitContact } from "@/components/features/contact-us/hooks/use-submit-contact";
import {
  contactServiceOptions,
  submitContactInput,
  type SubmitContactInput,
} from "@/components/features/contact-us/schemas/submit-contact";
import { authClient } from "@/lib/auth-client";

export function HelpSupportForm() {
  const { data: session } = authClient.useSession();
  const submitContact = useSubmitContact();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmitContactInput>({
    resolver: zodResolver(submitContactInput),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      termsAccepted: true,
      website: "",
    },
  });

  useEffect(() => {
    if (!session?.user) return;
    reset((values) => ({
      ...values,
      name: session.user.name ?? values.name,
      email: session.user.email ?? values.email,
    }));
  }, [session?.user, reset]);

  async function onSubmit(values: SubmitContactInput) {
    try {
      await submitContact.mutateAsync(values);
      toast.success("Message sent — we'll be in touch within 24 hours.");
      reset({
        name: session?.user.name ?? "",
        email: session?.user.email ?? "",
        phone: "",
        service: undefined,
        message: "",
        termsAccepted: true,
        website: "",
      });
    } catch {
      toast.error("Unable to send your message. Please try again.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-5 rounded-[28px] border border-[#d8d8cd] bg-white p-10"
    >
      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-[1.8px] text-[#546256] uppercase">
            Name
          </label>
          <input
            {...register("name")}
            placeholder="Your full name"
            className="rounded-3xl border border-[#d8d8cd] bg-[#e5ebd8]/40 px-[17px] py-[15px] text-sm text-[#0c1f13] outline-none placeholder:text-[#0c1f13]/50 focus-visible:border-[#185b50]"
          />
          {errors.name ? (
            <p className="text-xs text-[#fd3018]">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-[1.8px] text-[#546256] uppercase">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className="rounded-3xl border border-[#d8d8cd] bg-[#e5ebd8]/40 px-[17px] py-[15px] text-sm text-[#0c1f13] outline-none placeholder:text-[#0c1f13]/50 focus-visible:border-[#185b50]"
          />
          {errors.email ? (
            <p className="text-xs text-[#fd3018]">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-[1.8px] text-[#546256] uppercase">
            Phone
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="+1 (555) 000-0000"
            className="rounded-3xl border border-[#d8d8cd] bg-[#e5ebd8]/40 px-[17px] py-[15px] text-sm text-[#0c1f13] outline-none placeholder:text-[#0c1f13]/50 focus-visible:border-[#185b50]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs tracking-[1.8px] text-[#546256] uppercase">
            Service interest
          </label>
          <select
            {...register("service")}
            defaultValue=""
            className="rounded-3xl border border-[#d8d8cd] bg-[#e5ebd8]/40 px-[17px] py-[15px] text-sm text-[#0c1f13] outline-none focus-visible:border-[#185b50]"
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
          {errors.service ? (
            <p className="text-xs text-[#fd3018]">{errors.service.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs tracking-[1.8px] text-[#546256] uppercase">
          Message
        </label>
        <textarea
          {...register("message")}
          rows={4}
          placeholder="Tell us about your goals or any questions you have..."
          className="rounded-3xl border border-[#d8d8cd] bg-[#e5ebd8]/40 px-[17px] py-[13px] text-sm text-[#0c1f13] outline-none placeholder:text-[#0c1f13]/50 focus-visible:border-[#185b50]"
        />
        {errors.message ? (
          <p className="text-xs text-[#fd3018]">{errors.message.message}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={submitContact.isPending}
        className="w-full rounded-2xl bg-gradient-to-r from-[#f3b94c] via-[#d68900] to-[#f3b94c] px-[30px] py-4 text-base font-semibold text-[#1b0e04] transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {submitContact.isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
