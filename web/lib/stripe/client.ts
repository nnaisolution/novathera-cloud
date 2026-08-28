import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export function getStripe() {
  if (!stripePublishableKey) return null;
  stripePromise ??= loadStripe(stripePublishableKey);
  return stripePromise;
}
