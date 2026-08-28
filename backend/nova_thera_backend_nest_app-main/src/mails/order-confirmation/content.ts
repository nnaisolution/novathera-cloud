type OrderItemSummary = {
  name: string;
  quantity: number;
  unitPriceCents: number;
};

type OrderConfirmationParams = {
  appName: string;
  orderCode: string;
  totalCents: number;
  currency: string;
  items: OrderItemSummary[];
  intendedFor?: string;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function getOrderConfirmationContent({
  appName,
  orderCode,
  totalCents,
  currency,
  items,
  intendedFor,
}: OrderConfirmationParams) {
  const subject = `${appName} order confirmed — ${orderCode}`;
  const itemLines = items
    .map(
      (item) =>
        `${item.quantity}× ${item.name} — ${formatMoney(
          item.unitPriceCents * item.quantity,
          currency,
        )}`,
    )
    .join('\n');
  const itemHtml = items
    .map(
      (item) =>
        `<li>${item.quantity}× ${item.name} — ${formatMoney(
          item.unitPriceCents * item.quantity,
          currency,
        )}</li>`,
    )
    .join('');
  const total = formatMoney(totalCents, currency);
  const devNote = intendedFor
    ? `\n\n[Dev] This email was requested for ${intendedFor}.`
    : '';
  const devNoteHtml = intendedFor
    ? `<p><em>[Dev] This email was requested for ${intendedFor}.</em></p>`
    : '';

  const text = `Thanks for your order from ${appName}.\n\nOrder ${orderCode}\n\n${itemLines}\n\nTotal: ${total}\n\nWe'll email you again when your order ships.${devNote}`;

  const html = `
    <p>Thanks for your order from ${appName}.</p>
    ${devNoteHtml}
    <p><strong>Order ${orderCode}</strong></p>
    <ul>${itemHtml}</ul>
    <p><strong>Total: ${total}</strong></p>
    <p>We'll email you again when your order ships.</p>
  `;

  return { subject, text, html };
}
