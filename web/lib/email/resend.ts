import { TRPCError } from "@trpc/server";
import { Resend } from "resend";

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Email service is not configured.",
    });
  }

  return new Resend(apiKey);
}

export function getFromEmail() {
  return process.env.RESEND_FROM_EMAIL ?? "Nova Thera <onboarding@resend.dev>";
}

function isResendTestSender(from: string) {
  return from.includes("onboarding@resend.dev");
}

export function getRecipientEmails(
  envKey: "WAITLIST_ADMIN_EMAILS" | "CONTACT_ADMIN_EMAILS",
  fallback: string,
) {
  const from = getFromEmail();

  if (isResendTestSender(from) && process.env.RESEND_TEST_RECIPIENT?.trim()) {
    return [process.env.RESEND_TEST_RECIPIENT.trim()];
  }

  const raw = process.env[envKey];

  if (!raw?.trim()) {
    if (fallback) {
      return [fallback];
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `${envKey} is not configured.`,
    });
  }

  const emails = raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  if (emails.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `${envKey} is not configured.`,
    });
  }

  return emails;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function throwResendError(error: { message?: string }, context: string) {
  console.error(`[email] ${context}:`, error);

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message:
      error.message ??
      "Failed to send email. Check RESEND_FROM_EMAIL uses a verified domain.",
    cause: error,
  });
}
