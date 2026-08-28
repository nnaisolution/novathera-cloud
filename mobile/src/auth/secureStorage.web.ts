/**
 * Web-only variant of ./secureStorage, selected automatically by Metro's
 * platform extension resolution.
 *
 * `expo-secure-store` ships native implementations for Android, iOS and tvOS
 * only — on web the module loads but every call throws
 * (`ExpoSecureStore.default.getValueWithKeyAsync is not a function`), which
 * crashes AuthProvider before the first screen mounts. Web is a development
 * convenience for this project, not a shipping target, so this variant keeps
 * the app bootable in a browser.
 *
 * Storage is in-process only: nothing is written to localStorage,
 * sessionStorage or IndexedDB, so no session token is ever persisted to disk in
 * the browser. The practical consequence is that a page reload signs the user
 * out, which is the correct trade-off — the alternative would put bearer tokens
 * in web storage where any script on the origin could read them.
 */

const memoryStore = new Map<string, string>();

const ACCESS_TOKEN_KEY = "nt.accessToken";
const REFRESH_TOKEN_KEY = "nt.refreshToken";
const PATIENT_ID_KEY = "nt.patientId";
const ACCESS_TOKEN_EXPIRES_AT_KEY = "nt.accessTokenExpiresAt";
const NEST_TOKEN_KEY = "nt.nestToken";
const NEST_TOKEN_EXPIRES_AT_KEY = "nt.nestTokenExpiresAt";

const ALL_KEYS = [
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  PATIENT_ID_KEY,
  ACCESS_TOKEN_EXPIRES_AT_KEY,
  NEST_TOKEN_KEY,
  NEST_TOKEN_EXPIRES_AT_KEY,
] as const;

function setItem(key: string, value: string): void {
  memoryStore.set(key, value);
}

function getItem(key: string): string | null {
  return memoryStore.get(key) ?? null;
}

function toEpochMillis(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type PatientSessionInput = {
  accessToken: string;
  refreshToken: string;
  patientId: string;
  expiresInSeconds: number;
};

export async function saveSession(input: PatientSessionInput): Promise<void> {
  setItem(ACCESS_TOKEN_KEY, input.accessToken);
  setItem(REFRESH_TOKEN_KEY, input.refreshToken);
  setItem(PATIENT_ID_KEY, input.patientId);
  setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(Date.now() + input.expiresInSeconds * 1000));
}

export async function savePatientTokens(input: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}): Promise<void> {
  setItem(ACCESS_TOKEN_KEY, input.accessToken);
  setItem(REFRESH_TOKEN_KEY, input.refreshToken);
  setItem(ACCESS_TOKEN_EXPIRES_AT_KEY, String(Date.now() + input.expiresInSeconds * 1000));
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_TOKEN_KEY);
}

export async function getPatientId(): Promise<string | null> {
  return getItem(PATIENT_ID_KEY);
}

export async function getAccessTokenExpiresAt(): Promise<number | null> {
  return toEpochMillis(getItem(ACCESS_TOKEN_EXPIRES_AT_KEY));
}

export async function saveNestSession(input: {
  token: string;
  expiresAt: string;
}): Promise<void> {
  const expiresAtMillis = Date.parse(input.expiresAt);
  setItem(NEST_TOKEN_KEY, input.token);
  setItem(
    NEST_TOKEN_EXPIRES_AT_KEY,
    String(Number.isFinite(expiresAtMillis) ? expiresAtMillis : Date.now()),
  );
}

export async function getNestToken(): Promise<string | null> {
  return getItem(NEST_TOKEN_KEY);
}

export async function getNestTokenExpiresAt(): Promise<number | null> {
  return toEpochMillis(getItem(NEST_TOKEN_EXPIRES_AT_KEY));
}

/** Drops only the platform session, leaving the patient session usable. */
export async function clearNestSession(): Promise<void> {
  memoryStore.delete(NEST_TOKEN_KEY);
  memoryStore.delete(NEST_TOKEN_EXPIRES_AT_KEY);
}

export async function clearSession(): Promise<void> {
  for (const key of ALL_KEYS) memoryStore.delete(key);
}
