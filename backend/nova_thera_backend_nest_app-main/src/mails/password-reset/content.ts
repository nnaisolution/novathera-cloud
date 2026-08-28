type PasswordResetContentParams = {
  appName: string;
  url: string;
  intendedFor?: string;
};

export function getPasswordResetContent({
  appName,
  url,
  intendedFor,
}: PasswordResetContentParams) {
  const subject = `Reset your ${appName} password`;
  const devNote = intendedFor
    ? `\n\n[Dev] This email was requested for ${intendedFor}.`
    : '';
  const devNoteHtml = intendedFor
    ? `<p><em>[Dev] This email was requested for ${intendedFor}.</em></p>`
    : '';

  const text = `You requested a password reset for your ${appName} account.\n\nClick the link below to choose a new password:\n${url}\n\nIf you did not request this, you can ignore this email.${devNote}`;

  const html = `
    <p>You requested a password reset for your ${appName} account.</p>
    ${devNoteHtml}
    <p>Click the link below to choose a new password:</p>
    <p><a href="${url}">Reset password</a></p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  return { subject, text, html };
}
