import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { env } from "../config/env";
import {
  clearNestSession,
  clearSession,
  getAccessToken,
  getAccessTokenExpiresAt,
  getNestToken,
  getNestTokenExpiresAt,
  getPatientId,
  saveNestSession,
  saveSession,
} from "./secureStorage";
import { isAccessTokenExpired, refreshPatientSession } from "./patientSession";

type AuthStatus = "loading" | "signedOut" | "signedIn";

/**
 * Tracks the NestJS platform session separately from the patient session. The
 * two can diverge: the platform link is best-effort, so the app stays usable
 * for health and profile features when it is missing.
 */
export type NestStatus =
  | "unknown"
  | "linked"
  /** No usable platform session; bookings/membership/documents must be hidden. */
  | "unavailable";

type AuthContextValue = {
  status: AuthStatus;
  patientId: string | null;
  nestStatus: NestStatus;
  requestOtp: (phoneE164: string) => Promise<RequestOtpResult>;
  verifyOtp: (challengeId: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Called by the Nest tRPC client when the platform session is rejected. */
  markNestSessionExpired: () => void;
};

type RequestOtpResult = { challengeId: string; debugHint?: string };

type VerifyOtpResponse = {
  patientId: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  linkToken: string;
};

type SessionExchangeResponse = {
  token: string;
  expiresAt: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// These fetches used to be duplicated between this provider and src/auth/api.ts
// (which nothing imported). That module is gone; this file is now the single
// source of truth for the auth REST calls. Token refresh is the one exception —
// it lives in patientSession.ts because the tRPC clients must share its
// single-flight promise.

async function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
}

function isVerifyOtpResponse(value: unknown): value is VerifyOtpResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.patientId === "string" &&
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresInSeconds === "number" &&
    typeof candidate.linkToken === "string"
  );
}

function isSessionExchangeResponse(value: unknown): value is SessionExchangeResponse {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.token === "string" && typeof candidate.expiresAt === "string";
}

/**
 * Trades the 120-second link token for a Better Auth session.
 *
 * The link token is passed in memory straight from the verify response and is
 * never written to SecureStore: it is single-use, expires almost immediately,
 * and persisting it would leave a credential on disk that can mint platform
 * sessions.
 */
async function exchangeNestSession(linkToken: string): Promise<boolean> {
  try {
    const response = await postJson(`${env.nestApiUrl}/api/mobile/session-exchange`, {
      linkToken,
    });

    // 401 invalid/expired token, 409 phone-or-email collision, 429 rate limited,
    // 503 MOBILE_LINK_SECRET unset. None of these should block sign-in.
    if (!response.ok) return false;

    const payload: unknown = await response.json().catch(() => null);
    if (!isSessionExchangeResponse(payload)) return false;

    await saveNestSession(payload);
    return true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [patientId, setPatientId] = useState<string | null>(null);
  const [nestStatus, setNestStatus] = useState<NestStatus>("unknown");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [token, storedPatientId, expiresAt] = await Promise.all([
        getAccessToken(),
        getPatientId(),
        getAccessTokenExpiresAt(),
      ]);

      if (!token || !storedPatientId) {
        if (!cancelled) setStatus("signedOut");
        return;
      }

      // The old behaviour trusted any stored token; a 15-minute access token is
      // almost always stale by the next launch, so settle it before rendering.
      if (isAccessTokenExpired(expiresAt)) {
        const outcome = await refreshPatientSession();
        if (cancelled) return;

        if (outcome.status === "expired") {
          await clearSession();
          if (!cancelled) {
            setPatientId(null);
            setNestStatus("unknown");
            setStatus("signedOut");
          }
          return;
        }
        // "unavailable" means offline or a server problem. Signing the user out
        // over a network blip would be worse than letting requests fail and
        // recover through the 401 path once connectivity returns.
      }

      const [nestToken, nestExpiresAt] = await Promise.all([
        getNestToken(),
        getNestTokenExpiresAt(),
      ]);
      if (cancelled) return;

      const nestUsable =
        nestToken !== null && (nestExpiresAt === null || nestExpiresAt > Date.now());
      if (nestToken !== null && !nestUsable) {
        await clearNestSession();
      }

      if (cancelled) return;
      setPatientId(storedPatientId);
      setNestStatus(nestUsable ? "linked" : "unavailable");
      setStatus("signedIn");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestOtp = useCallback(async (phoneE164: string): Promise<RequestOtpResult> => {
    const response = await postJson(`${env.apiUrl}/api/auth/otp/request`, { phoneE164 });
    if (!response.ok) {
      throw new Error("Unable to start verification");
    }
    return (await response.json()) as RequestOtpResult;
  }, []);

  const verifyOtp = useCallback(async (challengeId: string, code: string) => {
    const response = await postJson(`${env.apiUrl}/api/auth/otp/verify`, {
      challengeId,
      code,
    });
    if (!response.ok) {
      throw new Error("Verification failed");
    }

    const payload: unknown = await response.json();
    if (!isVerifyOtpResponse(payload)) {
      throw new Error("Verification failed");
    }

    await saveSession({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      patientId: payload.patientId,
      expiresInSeconds: payload.expiresInSeconds,
    });

    setPatientId(payload.patientId);
    setStatus("signedIn");

    // Best-effort: the patient session is already valid, so a failure here
    // degrades platform features instead of failing sign-in.
    const linked = await exchangeNestSession(payload.linkToken);
    setNestStatus(linked ? "linked" : "unavailable");
  }, []);

  const signOut = useCallback(async () => {
    const nestToken = await getNestToken();
    if (nestToken) {
      try {
        // Better Auth revokes the session row; a failure here must not strand
        // the user in a signed-in UI, so the result is ignored.
        await fetch(`${env.nestApiUrl}/api/auth/sign-out`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${nestToken}`,
          },
          body: "{}",
        });
      } catch {
        // Offline sign-out still clears local credentials.
      }
    }

    await clearSession();
    setPatientId(null);
    setNestStatus("unknown");
    setStatus("signedOut");
  }, []);

  const markNestSessionExpired = useCallback(() => {
    setNestStatus("unavailable");
  }, []);

  const value = useMemo(
    () => ({
      status,
      patientId,
      nestStatus,
      requestOtp,
      verifyOtp,
      signOut,
      markNestSessionExpired,
    }),
    [
      status,
      patientId,
      nestStatus,
      requestOtp,
      verifyOtp,
      signOut,
      markNestSessionExpired,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
