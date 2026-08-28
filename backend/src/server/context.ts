import { timingSafeEqual } from "node:crypto";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import { verifyAccessToken } from "../lib/http/jwt";

function matchesStaffApiKey(token: string): boolean {
  const expected = env.HEALTH_STAFF_API_KEY;
  if (!expected) return false;
  const provided = Buffer.from(token);
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) return false;
  return timingSafeEqual(provided, secret);
}

export async function createContext(opts: FetchCreateContextFnOptions) {
  const header = opts.req.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const patientId = token ? await verifyAccessToken(token) : null;
  // Staff key is a separate shared secret, never a patient access JWT.
  const isStaff = Boolean(token && !patientId && matchesStaffApiKey(token));
  return { prisma, patientId, isStaff };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
