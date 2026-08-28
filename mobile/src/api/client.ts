import { env } from "../config/env";
import { getValidPatientAccessToken, refreshPatientSession } from "../auth/patientSession";

/**
 * Plain REST access to the patient API for the endpoints that are not tRPC
 * procedures. Shares the tRPC clients' token handling: the same proactive
 * refresh, the same single-flight rotation, and one retry on a 401.
 */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await sendWithToken(path, init, await getValidPatientAccessToken());
  if (response.status !== 401) return response;

  const outcome = await refreshPatientSession();
  if (outcome.status !== "refreshed") return response;

  // Exactly one retry, and the refresh itself never routes back through here,
  // so a persistently rejected token cannot loop.
  return sendWithToken(path, init, outcome.accessToken);
}

function sendWithToken(
  path: string,
  init: RequestInit,
  accessToken: string | null,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return fetch(`${env.apiUrl}${path}`, { ...init, headers });
}

export async function ingestHealthObservations(body: unknown): Promise<Response> {
  return apiFetch("/api/health/ingest", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
