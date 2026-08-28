"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { getAppUrl, PENDING_VERIFICATION_EMAIL_KEY } from "@/lib/auth/constants";

import type { LoginFormValues } from "../schemas/login.schema";

type SocialProvider = "google" | "apple" | "facebook";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSocialPending, setIsSocialPending] = useState<SocialProvider | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const getNextPath = () => searchParams.get("next") ?? "/";

  const login = async (values: LoginFormValues) => {
    setIsPending(true);
    setError(null);

    const next = getNextPath();

    let signInError: { message?: string; status?: number } | null = null;

    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: `${getAppUrl()}${next}`,
      });
      signInError = result.error;
    } catch {
      setIsPending(false);
      setError(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
      return;
    }

    setIsPending(false);

    if (signInError) {
      const needsVerification =
        signInError.status === 403 ||
        (signInError as { code?: string }).code === "EMAIL_NOT_VERIFIED";

      if (needsVerification) {
        sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, values.email);
        router.push(`/verify-email?next=${encodeURIComponent(next)}`);
        return;
      }

      setError(
        signInError.message ?? "Invalid email or password. Please try again.",
      );
      return;
    }

    router.push(next);
  };

  const loginWithSocial = async (provider: SocialProvider) => {
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
            ? `${providerLabel} sign-in is not enabled yet. Please use email login.`
            : (result.error.message ??
                `${providerLabel} sign-in is unavailable. Please try email login.`),
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
    login,
    loginWithGoogle: () => loginWithSocial("google"),
    loginWithApple: () => loginWithSocial("apple"),
    loginWithFacebook: () => loginWithSocial("facebook"),
    isPending,
    isGooglePending: isSocialPending === "google",
    isApplePending: isSocialPending === "apple",
    isFacebookPending: isSocialPending === "facebook",
    isSocialPending: isSocialPending !== null,
    error,
  };
}
