import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter as NestAppRouter } from "../types/trpc/app-router";
import { env } from "../config/env";
import { clearNestSession } from "../auth/secureStorage";
import { unauthorizedLink } from "./unauthorizedLink";

export type { NestAppRouter };

export type NestTrpcClientOptions = {
  getToken: () => Promise<string | null>;
  /**
   * Invoked once when the platform session is rejected. The patient session is
   * untouched, so the app degrades to patient-only features rather than
   * signing out.
   */
  onSessionExpired: () => void | Promise<void>;
};

/**
 * A rejected platform session cannot be recovered silently.
 *
 * `MobileSessionService.exchange` (backend/nova_thera_backend_nest_app-main/
 * src/mobile/mobile-session.service.ts) takes a `linkToken` and nothing else,
 * and `verifyLinkToken` requires an unexpired HS256 token carrying `typ:"link"`
 * signed with MOBILE_LINK_SECRET. In the patient API `signLinkToken` is called
 * from exactly one place — `verifyOtp` — and mints a 120-second token. The
 * refresh endpoint does not return one. So there is no credential the app can
 * hold that would let it re-run the exchange in the background; only a fresh
 * SMS verification produces one.
 *
 * Retrying with the same dead token would just burn the exchange rate limit
 * (10 per 5 minutes per IP), so this link never retries.
 */
export function createNestTrpcClient(options: NestTrpcClientOptions) {
  // Single-flight, mirroring the patient client: parallel queries hitting 401
  // together must invalidate once, not once per query.
  let invalidationInFlight: Promise<void> | null = null;

  const invalidate = (): Promise<void> => {
    if (invalidationInFlight) return invalidationInFlight;

    const run = (async () => {
      await clearNestSession();
      await options.onSessionExpired();
    })().finally(() => {
      if (invalidationInFlight === run) invalidationInFlight = null;
    });

    invalidationInFlight = run;
    return run;
  };

  return createTRPCClient<NestAppRouter>({
    links: [
      unauthorizedLink<NestAppRouter>(async () => {
        await invalidate();
        // Always "fail": see the note above on why a silent re-exchange is
        // impossible. This is also the loop guard — no retry can be issued.
        return "fail";
      }),
      httpBatchLink({
        url: `${env.nestApiUrl}/trpc`,
        transformer: superjson,
        async headers() {
          // Better Auth's bearer() plugin accepts the session token issued by
          // the session exchange.
          const token = await options.getToken();
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

export type NestTrpcClient = ReturnType<typeof createNestTrpcClient>;
