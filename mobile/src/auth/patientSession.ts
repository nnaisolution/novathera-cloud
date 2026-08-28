import { env } from "../config/env";
import {
  getAccessToken,
  getAccessTokenExpiresAt,
  getRefreshToken,
  savePatientTokens,
} from "./secureStorage";

/**
 * Refresh this long before the recorded expiry so a request that is already in
 * flight cannot land after the token has died.
 */
const EXPIRY_SKEW_MS = 60_000;

export type RefreshOutcome =
  | { status: "refreshed"; accessToken: string }
  /** The refresh token was rejected. Nothing can recover this but a new OTP. */
  | { status: "expired" }
  /** Transport or server problem. The session may still be fine when back online. */
  | { status: "unavailable" };

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

function isRefreshResponse(value: unknown): value is RefreshResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresInSeconds === "number"
  );
}

/**
 * Shared by the tRPC clients and by the auth provider's startup check so that
 * every caller in the app queues behind one network refresh.
 */
let refreshInFlight: Promise<RefreshOutcome> | null = null;

async function performRefresh(): Promise<RefreshOutcome> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return { status: "expired" };

  let response: Response;
  try {
    // Deliberately the global fetch and not a tRPC client: the refresh call can
    // never travel back through the 401 link that triggered it, so no amount of
    // failure here can produce a refresh loop.
    response = await fetch(`${env.apiUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    return { status: "unavailable" };
  }

  if (response.status === 401) return { status: "expired" };
  if (!response.ok) return { status: "unavailable" };

  const payload: unknown = await response.json().catch(() => null);
  if (!isRefreshResponse(payload)) return { status: "unavailable" };

  // The server revoked the refresh token it was given, so the rotated pair has
  // to be persisted before anything else uses the session.
  await savePatientTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresInSeconds: payload.expiresInSeconds,
  });

  return { status: "refreshed", accessToken: payload.accessToken };
}

/**
 * Single-flight refresh. Parallel queries that all see a 401 share one rotation
 * instead of racing; without this, the second refresh would present a token the
 * first one had already revoked and would sign the user out.
 */
export function refreshPatientSession(): Promise<RefreshOutcome> {
  if (refreshInFlight) return refreshInFlight;

  const run = performRefresh().finally(() => {
    // Guard against clearing a newer refresh that started after this one.
    if (refreshInFlight === run) refreshInFlight = null;
  });
  refreshInFlight = run;
  return run;
}

/**
 * The access token if it is still comfortably valid, otherwise the product of a
 * refresh. Returns null when there is no usable session at all.
 */
export async function getValidPatientAccessToken(): Promise<string | null> {
  const [token, expiresAt] = await Promise.all([
    getAccessToken(),
    getAccessTokenExpiresAt(),
  ]);

  if (!token) return null;
  // A token stored before expiries were tracked has no timestamp; let it be used
  // and rely on the 401 path rather than forcing a sign-out on upgrade.
  if (expiresAt === null) return token;
  if (Date.now() < expiresAt - EXPIRY_SKEW_MS) return token;

  const outcome = await refreshPatientSession();
  return outcome.status === "refreshed" ? outcome.accessToken : null;
}

export function isAccessTokenExpired(expiresAt: number | null): boolean {
  if (expiresAt === null) return false;
  return Date.now() >= expiresAt - EXPIRY_SKEW_MS;
}
