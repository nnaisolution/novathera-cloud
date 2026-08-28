type EmailVerificationContentParams = {
  appName: string;
  url: string;
  intendedFor?: string;
};

export function getEmailVerificationContent({
  appName,
  url,
  intendedFor,
}: EmailVerificationContentParams) {
  const subject = `Verify your ${appName} email`;
  const devNote = intendedFor
    ? `\n\n[Dev] This email was requested for ${intendedFor}.`
    : '';
  const devNoteHtml = intendedFor
    ? `<p><em>[Dev] This email was requested for ${intendedFor}.</em></p>`
    : '';

  const text = `Welcome to ${appName}.\n\nClick the link below to verify your email address:\n${url}\n\nIf you did not create an account, you can ignore this email.${devNote}`;

  const html = `
    <p>Welcome to ${appName}.</p>
    ${devNoteHtml}
    <p>Click the link below to verify your email address:</p>
    <p><a href="${url}">Verify email</a></p>
    <p>If you did not create an account, you can ignore this email.</p>
  `;

  return { subject, text, html };
}
