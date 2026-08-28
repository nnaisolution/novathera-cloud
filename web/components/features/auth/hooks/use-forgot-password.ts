"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { getAppUrl } from "@/lib/auth/constants";

import type { ForgotPasswordFormValues } from "../schemas/forgot-password.schema";

export function useForgotPassword() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const requestReset = async (values: ForgotPasswordFormValues) => {
    setIsPending(true);
    setError(null);
    setIsSuccess(false);

    try {
      const result = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${getAppUrl()}/reset-password`,
      });

      if (result.error) {
        setError(
          result.error.message ??
            "Unable to send a reset link. Please try again.",
        );
        setIsPending(false);
        return;
      }

      setIsSuccess(true);
    } catch {
      setError(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return { requestReset, isPending, error, isSuccess };
}
