"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import type { ResetPasswordFormValues } from "../schemas/reset-password.schema";

export function useResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get("token");

  const resetPassword = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      const result = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (result.error) {
        setError(
          result.error.message ??
            "Unable to reset your password. Please request a new link.",
        );
        setIsPending(false);
        return;
      }

      router.push("/login");
    } catch {
      setError(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
      setIsPending(false);
    }
  };

  return { resetPassword, isPending, error, hasToken: Boolean(token) };
}
