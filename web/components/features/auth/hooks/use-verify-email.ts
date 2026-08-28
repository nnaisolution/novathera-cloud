"use client";

import { useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getAppUrl } from "@/lib/auth/constants";

export function useVerifyEmail() {
  const [isResending, setIsResending] = useState(false);

  const resendVerificationEmail = async (email: string, next = "/") => {
    if (!email) {
      toast.error("No email address found. Please register again.");
      return;
    }

    setIsResending(true);

    let error: { message?: string } | null = null;

    try {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: `${getAppUrl()}${next}`,
      });
      error = result.error;
    } catch {
      setIsResending(false);
      toast.error(
        "Unable to reach the authentication server. Ensure the backend is running on port 4000.",
      );
      return;
    }

    setIsResending(false);

    if (error) {
      toast.error(error.message ?? "Unable to resend verification email.");
      return;
    }

    toast.success("Verification email sent. Check your inbox.");
  };

  return { resendVerificationEmail, isResending };
}
