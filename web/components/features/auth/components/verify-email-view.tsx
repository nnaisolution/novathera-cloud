"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthSplitShell } from "@/components/features/auth/components/auth-split-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PENDING_VERIFICATION_EMAIL_KEY } from "@/lib/auth/constants";

import { useVerifyEmail } from "../hooks/use-verify-email";

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const { resendVerificationEmail, isResending } = useVerifyEmail();
  const [email, setEmail] = useState("");

  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    const emailFromStorage = sessionStorage.getItem(
      PENDING_VERIFICATION_EMAIL_KEY,
    );
    setEmail(emailFromQuery ?? emailFromStorage ?? "");
  }, [searchParams]);

  return (
    <AuthSplitShell
      title="Verify your email"
      subtitle="We sent a verification link to your email. Click the link to continue."
    >
      <div className="flex w-full flex-col gap-5">
        <div className="flex items-center gap-2.5 rounded-2xl bg-white px-5 py-4">
          <MailCheck className="size-6 shrink-0 text-[#185b50]" aria-hidden />
          {email ? (
            <p className="min-w-0 truncate text-base tracking-[0.01em] text-[#222]">
              Verification link sent to{" "}
              <span className="font-semibold text-[#185b50]">{email}</span>
            </p>
          ) : (
            <p className="text-base tracking-[0.01em] text-[#222]">
              Check your inbox for the verification link.
            </p>
          )}
        </div>

        <Button
          type="button"
          disabled={isResending || !email}
          onClick={() => resendVerificationEmail(email, next)}
          className="h-[52px] w-full rounded-2xl bg-[#185b50] px-[30px] text-base font-normal text-white hover:bg-[#185b50]/90"
        >
          {isResending ? "Sending..." : "Resend verification email"}
        </Button>

        <div className="flex w-full items-center gap-[30px]">
          <div className="min-w-0 flex-1">
            <Separator className="bg-[#222]/20" />
          </div>
          <span className="text-base tracking-[0.01em] text-[#222]">or</span>
          <div className="min-w-0 flex-1">
            <Separator className="bg-[#222]/20" />
          </div>
        </div>

        <p className="text-center text-base tracking-[0.01em] text-[#222]">
          Already verified?{" "}
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="font-semibold text-[#185b50] underline underline-offset-2 hover:opacity-90"
          >
            Login
          </Link>
        </p>

        <p className="text-center text-base tracking-[0.01em] text-[#222]">
          Wrong email?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#185b50] underline underline-offset-2 hover:opacity-90"
          >
            Create a new account
          </Link>
        </p>
      </div>
    </AuthSplitShell>
  );
}
