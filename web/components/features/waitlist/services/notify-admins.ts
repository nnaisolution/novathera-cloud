import type { JoinWaitlistInput } from "@/components/features/waitlist/schemas/join-waitlist";
import {
  escapeHtml,
  getFromEmail,
  getRecipientEmails,
  getResendClient,
  throwResendError,
} from "@/lib/email/resend";

const DEFAULT_WAITLIST_RECIPIENT = "marketing@novathera.ca";

export async function notifyAdmins(input: Omit<JoinWaitlistInput, "website">) {
  const resend = getResendClient();
  const to = getRecipientEmails(
    "WAITLIST_ADMIN_EMAILS",
    DEFAULT_WAITLIST_RECIPIENT,
  );
  const from = getFromEmail();

  const phone = input.phone?.trim() ? input.phone.trim() : "Not provided";
  const source = input.source?.trim() ? input.source.trim() : "Website";
  const submittedAt = new Date().toISOString();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: `New waitlist signup: ${input.name}`,
    html: `
      <h2>New waitlist signup</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Source:</strong> ${escapeHtml(source)}</p>
      <p><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
    `,
  });

  if (error) {
    throwResendError(error, "waitlist");
  }

  return data;
}
