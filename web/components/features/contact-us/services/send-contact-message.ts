import type { SubmitContactInput } from "@/components/features/contact-us/schemas/submit-contact";
import {
  escapeHtml,
  getFromEmail,
  getRecipientEmails,
  getResendClient,
  throwResendError,
} from "@/lib/email/resend";

const DEFAULT_CONTACT_RECIPIENT = "marketing@novathera.ca";

export async function sendContactMessage(
  input: Omit<SubmitContactInput, "website">,
) {
  const resend = getResendClient();
  const to = getRecipientEmails("CONTACT_ADMIN_EMAILS", DEFAULT_CONTACT_RECIPIENT);
  const from = getFromEmail();

  const phone = input.phone?.trim() ? input.phone.trim() : "Not provided";
  const submittedAt = new Date().toISOString();

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `Contact form: ${input.name} — ${input.service}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Service:</strong> ${escapeHtml(input.service)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replaceAll("\n", "<br />")}</p>
      <p><strong>Submitted at:</strong> ${escapeHtml(submittedAt)}</p>
    `,
  });

  if (error) {
    throwResendError(error, "contact form");
  }

  return data;
}
