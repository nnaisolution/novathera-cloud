import * as SecureStore from "expo-secure-store";

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

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  requireAuthentication: false,
};

/**
 * Expiries are stored as absolute epoch milliseconds derived from the
 * `expiresInSeconds` the API returns, rather than by decoding the JWT. React
 * Native has no dependable `atob`, and a parser would only recover a number the
 * server already handed us.
 */
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
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, input.accessToken, secureOptions),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, input.refreshToken, secureOptions),
    SecureStore.setItemAsync(PATIENT_ID_KEY, input.patientId, secureOptions),
    SecureStore.setItemAsync(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      String(Date.now() + input.expiresInSeconds * 1000),
      secureOptions,
    ),
  ]);
}

/**
 * Persists a rotated token pair. The patient API revokes the old refresh token
 * on every refresh, so both values have to land together or the next refresh
 * will fail against a revoked row.
 */
export async function savePatientTokens(input: {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, input.accessToken, secureOptions),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, input.refreshToken, secureOptions),
    SecureStore.setItemAsync(
      ACCESS_TOKEN_EXPIRES_AT_KEY,
      String(Date.now() + input.expiresInSeconds * 1000),
      secureOptions,
    ),
  ]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function getPatientId(): Promise<string | null> {
  return SecureStore.getItemAsync(PATIENT_ID_KEY);
}

export async function getAccessTokenExpiresAt(): Promise<number | null> {
  return toEpochMillis(await SecureStore.getItemAsync(ACCESS_TOKEN_EXPIRES_AT_KEY));
}

export async function saveNestSession(input: {
  token: string;
  expiresAt: string;
}): Promise<void> {
  const expiresAtMillis = Date.parse(input.expiresAt);
  await Promise.all([
    SecureStore.setItemAsync(NEST_TOKEN_KEY, input.token, secureOptions),
    SecureStore.setItemAsync(
      NEST_TOKEN_EXPIRES_AT_KEY,
      // An unparseable date must not be persisted as NaN, which would read back
      // as "already expired" and silently disable every platform feature.
      String(Number.isFinite(expiresAtMillis) ? expiresAtMillis : Date.now()),
      secureOptions,
    ),
  ]);
}

export async function getNestToken(): Promise<string | null> {
  return SecureStore.getItemAsync(NEST_TOKEN_KEY);
}

export async function getNestTokenExpiresAt(): Promise<number | null> {
  return toEpochMillis(await SecureStore.getItemAsync(NEST_TOKEN_EXPIRES_AT_KEY));
}

/** Drops only the platform session, leaving the patient session usable. */
export async function clearNestSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(NEST_TOKEN_KEY),
    SecureStore.deleteItemAsync(NEST_TOKEN_EXPIRES_AT_KEY),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all(ALL_KEYS.map((key) => SecureStore.deleteItemAsync(key)));
}
