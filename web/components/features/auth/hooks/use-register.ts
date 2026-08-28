"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import {
  getAppUrl,
  PENDING_VERIFICATION_EMAIL_KEY,
} from "@/lib/auth/constants";

import type { RegisterFormValues } from "../schemas/register.schema";

type SocialProvider = "google" | "apple" | "facebook";

export function useRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSocialPending, setIsSocialPending] = useState<SocialProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const getNextPath = () => searchParams.get("next") ?? "/";

  const register = async (values: RegisterFormValues) => {
    setIsPending(true);
    setError(null);

    const next = getNextPath();
    const fullPhone = `${values.countryCode}${values.phone}`;

    let signUpError: { message?: string } | null = null;

    try {
      // callbackURL is where Better Auth sends the user after they click the
      // verification email link — not a redirect after this signUp call.
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
        phoneNumber: fullPhone,
        marketingOptIn: values.marketingOptIn,
        firstName: values.firstName,
        lastName: values.lastName,
        callbackURL: `${getAppUrl()}${next}`,
      } as Parameters<typeof authClient.signUp.email>[0]);
      signUpError = result.error;
    } catch {
      setIsPending(false);
      setError(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
      return;
    }

    setIsPending(false);

    if (signUpError) {
      setError(
        signUpError.message ?? "Unable to create your account. Please try again.",
      );
      return;
    }

    // Email verification is required — always show the check-email screen.
    // Do not attempt sign-in here (session is only created after verify).
    sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, values.email);
    router.push(`/verify-email?next=${encodeURIComponent(next)}`);
  };

  const signUpWithSocial = async (provider: SocialProvider) => {
    setIsSocialPending(provider);
    setError(null);

    const next = getNextPath();
    const providerLabel =
      provider === "google"
        ? "Google"
        : provider === "apple"
          ? "Apple"
          : "Facebook";

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: `${getAppUrl()}${next}`,
      });

      if (result.error) {
        setError(
          result.error.status === 404
            ? `${providerLabel} sign-up is not enabled yet. Please continue with email.`
            : (result.error.message ??
                `${providerLabel} sign-up is unavailable. Please continue with email.`),
        );
        setIsSocialPending(null);
      }
    } catch {
      setError(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
      setIsSocialPending(null);
    }
  };

  return {
    register,
    signUpWithGoogle: () => signUpWithSocial("google"),
    signUpWithApple: () => signUpWithSocial("apple"),
    signUpWithFacebook: () => signUpWithSocial("facebook"),
    isPending,
    isGooglePending: isSocialPending === "google",
    isApplePending: isSocialPending === "apple",
    isFacebookPending: isSocialPending === "facebook",
    isSocialPending: isSocialPending !== null,
    error,
  };
}
