"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { useJoinWaitlist } from "@/components/features/waitlist/hooks/use-join-waitlist";

const footerSignupInput = z.object({
  email: z.email("Enter a valid email address").max(255),
});

type FooterSignupInput = z.infer<typeof footerSignupInput>;

export function HomePageV2FooterSignupForm() {
  const pathname = usePathname();
  const joinWaitlist = useJoinWaitlist();

  const form = useForm<FooterSignupInput>({
    resolver: zodResolver(footerSignupInput),
    defaultValues: { email: "" },
  });

  function onSubmit({ email }: FooterSignupInput) {
    const name = email.split("@")[0]?.trim() || "Website visitor";

    joinWaitlist.mutate(
      {
        name,
        email,
        source: `home-page-v2-footer:${pathname}`,
        website: "",
      },
      {
        onSuccess: () => {
          toast.success("You're on the list", {
            description: "We'll be in touch the moment we launch.",
          });
          form.reset();
        },
        onError: (error) => {
          toast.error("Something went wrong", {
            description: error.message || "Please try again in a moment.",
          });
        },
      },
    );
  }

  return (
    <div className="w-full max-w-[576px] pt-4">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3"
      >
        <label className="sr-only" htmlFor="home-page-v2-footer-email">
          Your email
        </label>
        <input
          id="home-page-v2-footer-email"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          className="h-[52px] min-w-0 flex-1 rounded-full border border-[rgba(248,245,236,0.2)] bg-[rgba(248,245,236,0.1)] px-[21px] text-[16px] text-[#f8f5ec] placeholder:text-[rgba(248,245,236,0.6)] outline-none focus:border-[rgba(248,245,236,0.4)]"
          {...form.register("email")}
        />
        <button
          type="submit"
          disabled={joinWaitlist.isPending}
          className="inline-flex h-[49px] shrink-0 items-center justify-center rounded-full bg-[#faf5e8] px-7 text-[16px] font-medium text-[#0c1f13] transition-colors hover:bg-[#faf5e8]/90 disabled:opacity-70"
        >
          {joinWaitlist.isPending ? "Sending…" : "Reserve a visit"}
        </button>
      </form>
      {form.formState.errors.email ? (
        <p className="mt-2 text-sm text-[#f8f5ec]/80">
          {form.formState.errors.email.message}
        </p>
      ) : null}
    </div>
  );
}
