import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Claims the patient API puts in a mobile link token. Kept in sync by hand with
 * `signLinkToken` in the Next.js app (backend/src/lib/http/jwt.ts).
 */
export type LinkTokenClaims = {
  patientId: string;
  phoneE164: string;
};

/** The patient API signs access tokens with `typ: "access"` and link tokens
 * with `typ: "link"`. Refusing anything else keeps an access token from being
 * traded for a platform session even if the two secrets are ever unified. */
const LINK_TOKEN_TYPE = 'link';
const E164 = /^\+[1-9]\d{7,14}$/;

function decodeSegment(segment: string): unknown {
  return JSON.parse(
    Buffer.from(segment, 'base64url').toString('utf8'),
  ) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Verifies an HS256 JWT minted by the patient API and returns its claims, or
 * null when the token is malformed, wrongly signed, expired or not a link
 * token. Implemented directly on node:crypto because this service has no JWT
 * dependency and only ever needs to check this one algorithm.
 */
export function verifyLinkToken(
  token: string,
  secret: string,
): LinkTokenClaims | null {
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  let header: unknown;
  let payload: unknown;
  try {
    header = decodeSegment(headerSegment);
    payload = decodeSegment(payloadSegment);
  } catch {
    return null;
  }

  // Pin the algorithm so a token re-signed with "none", or with an asymmetric
  // alg naming our secret as the public key, cannot be accepted.
  if (!isRecord(header) || header.alg !== 'HS256') return null;

  const expected = createHmac('sha256', secret)
    .update(`${headerSegment}.${payloadSegment}`)
    .digest();
  const provided = Buffer.from(signatureSegment, 'base64url');
  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    return null;
  }

  if (!isRecord(payload)) return null;
  if (payload.typ !== LINK_TOKEN_TYPE) return null;

  const { sub, phoneE164, exp } = payload;
  if (typeof exp !== 'number' || exp * 1000 <= Date.now()) return null;
  if (typeof sub !== 'string' || sub.length === 0) return null;
  if (typeof phoneE164 !== 'string' || !E164.test(phoneE164)) return null;

  return { patientId: sub, phoneE164 };
}
