import * as WebBrowser from "expo-web-browser";

import { colors } from "../../theme";

export type PaymentBrowserResult =
  /** The browser was presented. On iOS this also means it has since closed. */
  | "opened"
  /** The API returned no URL, so there is nothing to open. */
  | "missingUrl"
  /** The device could not present a browser at all. */
  | "failed";

/**
 * Opens a Stripe Checkout or Billing Portal URL.
 *
 * `openBrowserAsync` rather than `openAuthSessionAsync`: there is no redirect
 * back into the app to capture, and the ephemeral auth session would drop the
 * Stripe cookies that make the hosted pages work.
 *
 * The promise resolves when the sheet is dismissed on iOS, but as soon as the
 * custom tab is handed off on Android. Callers should therefore treat a refetch
 * afterwards as best-effort — Stripe confirms by webhook, not on return — and
 * leave pull-to-refresh available.
 */
export async function openPaymentUrl(url: string | null | undefined): Promise<PaymentBrowserResult> {
  if (!url) return "missingUrl";

  try {
    await WebBrowser.openBrowserAsync(url, {
      controlsColor: colors.primary,
      toolbarColor: colors.background,
      dismissButtonStyle: "done",
    });
    return "opened";
  } catch {
    return "failed";
  }
}
