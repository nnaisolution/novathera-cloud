import { SignJWT, jwtVerify } from "jose";
import { env } from "../../config/env";

const encoder = new TextEncoder();

export async function signAccessToken(patientId: string): Promise<string> {
  return new SignJWT({ sub: patientId, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encoder.encode(env.JWT_ACCESS_SECRET));
}

export async function signLinkToken(patientId: string, phoneE164: string): Promise<string> {
  return new SignJWT({ sub: patientId, phoneE164, typ: "link" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("120s")
    .sign(encoder.encode(env.MOBILE_LINK_SECRET));
}

export async function verifyAccessToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(env.JWT_ACCESS_SECRET));
    // Reject anything that is not an access token so short-lived link tokens can
    // never be replayed against the patient API, even if the secrets are shared.
    if (payload.typ !== "access") return null;
    if (typeof payload.sub !== "string") return null;
    return payload.sub;
  } catch {
    return null;
  }
}
