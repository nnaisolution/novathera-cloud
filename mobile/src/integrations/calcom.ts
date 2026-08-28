import { env } from "../config/env";

export function getBookingUrl(patientId: string): string {
  const url = new URL(env.calComEmbedUrl);
  url.searchParams.set("metadata[patientId]", patientId);
  return url.toString();
}
