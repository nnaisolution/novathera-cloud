import { NextResponse } from "next/server";
import { env } from "../../config/env";

export function allowedOrigins(): string[] {
  return env.ALLOWED_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = allowedOrigins();
  // Echo the request Origin when it is allow-listed so POST (not only OPTIONS)
  // can satisfy browsers. A mismatched fallback origin is treated as a CORS
  // failure by fetch, which the mobile phone screen maps to a generic send-code error.
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Credentials": "false",
    Vary: "Origin",
  };
}

export function json(data: unknown, init?: { status?: number; origin?: string | null }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: corsHeaders(init?.origin ?? null),
  });
}
