type ShippingNotificationParams = {
  appName: string;
  orderCode: string;
  trackingNumber: string;
  intendedFor?: string;
};

export function getShippingNotificationContent({
  appName,
  orderCode,
  trackingNumber,
  intendedFor,
}: ShippingNotificationParams) {
  const subject = `${appName} order ${orderCode} has shipped`;
  const devNote = intendedFor
    ? `\n\n[Dev] This email was requested for ${intendedFor}.`
    : '';
  const devNoteHtml = intendedFor
    ? `<p><em>[Dev] This email was requested for ${intendedFor}.</em></p>`
    : '';

  const text = `Good news — your ${appName} order ${orderCode} is on its way.\n\nTracking number: ${trackingNumber}\n\nThank you for shopping with us.${devNote}`;

  const html = `
    <p>Good news — your ${appName} order <strong>${orderCode}</strong> is on its way.</p>
    ${devNoteHtml}
    <p>Tracking number: <strong>${trackingNumber}</strong></p>
    <p>Thank you for shopping with us.</p>
  `;

  return { subject, text, html };
}
