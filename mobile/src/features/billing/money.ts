/**
 * Every amount the platform API returns is an integer in a currency's minor
 * unit (Stripe's convention), so it must never be rendered directly — 12000
 * is $120.00, not $12,000.
 */

/**
 * Bookings carry their own currency code. The membership payload does not:
 * `MembershipPlanDefinition` is `{ id, name, description, priceCents }` with no
 * currency, and the Stripe prices behind it are the clinic's Canadian ones, so
 * membership amounts are labelled CAD here rather than guessed per device.
 */
export const CLINIC_CURRENCY = "CAD";

const formatterCache = new Map<string, Intl.NumberFormat | null>();

function formatterFor(currencyCode: string): Intl.NumberFormat | null {
  const cached = formatterCache.get(currencyCode);
  if (cached !== undefined) return cached;

  let formatter: Intl.NumberFormat | null = null;
  try {
    formatter = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    });
  } catch {
    // A malformed code makes Intl throw rather than degrade, and a price is
    // still worth showing without its symbol.
    formatter = null;
  }

  formatterCache.set(currencyCode, formatter);
  return formatter;
}

/** Stripe sends codes lowercase ("cad"); Intl wants the ISO 4217 form. */
export function formatMoneyCents(cents: number, currency: string = CLINIC_CURRENCY): string {
  if (!Number.isFinite(cents)) return "—";

  const code = currency.trim().toUpperCase();
  const amount = cents / 100;
  const formatter = formatterFor(code);

  return formatter ? formatter.format(amount) : `${amount.toFixed(2)} ${code}`;
}
