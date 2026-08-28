import { z } from "zod";

function isNonProductionRuntime(): boolean {
  const appEnv = process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
  return appEnv !== "production";
}

/** Missing OTP_DEV_BYPASS defaults true outside production; explicit "false" stays off. */
export function parseOtpDevBypass(raw: string | undefined): boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return isNonProductionRuntime();
}

const envSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(64),
  PHONE_HASH_PEPPER: z.string().min(16),
  OTP_PEPPER: z.string().min(16),
  JWT_ACCESS_SECRET: z.string().min(32),
  MOBILE_LINK_SECRET: z.string().min(32),
  REFRESH_TOKEN_PEPPER: z.string().min(16),
  OTP_DEV_BYPASS: z
    .string()
    .optional()
    .transform((v) => parseOtpDevBypass(v)),
  CALCOM_WEBHOOK_SECRET: z.string().optional().default(""),
  POLAR_WEBHOOK_SECRET: z.string().optional().default(""),
  ALLOWED_ORIGINS: z.string().default("http://localhost:8081"),
  /**
   * Shared secret for staff/admin reads of health observations (admin BFF).
   * Patient JWTs are never accepted as this key. Unset = staff list disabled.
   */
  HEALTH_STAFF_API_KEY: z.string().optional().default(""),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) {
    if (parsed.data.APP_ENV === "production" && parsed.data.OTP_DEV_BYPASS) {
      throw new Error("OTP_DEV_BYPASS cannot be enabled in production");
    }
    return parsed.data;
  }

  if (process.env.APP_ENV === "production") {
    throw new Error("Invalid production environment configuration");
  }

  return {
    APP_ENV: (process.env.APP_ENV as AppEnv["APP_ENV"]) ?? "development",
    DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/novathera?schema=public",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY ?? "0".repeat(64),
    PHONE_HASH_PEPPER: process.env.PHONE_HASH_PEPPER ?? "dev-phone-pepper-change-me",
    OTP_PEPPER: process.env.OTP_PEPPER ?? "dev-otp-pepper-change-me",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "dev-jwt-access-secret-change-me-32",
    MOBILE_LINK_SECRET: process.env.MOBILE_LINK_SECRET ?? "dev-mobile-link-secret-change-me-32",
    REFRESH_TOKEN_PEPPER: process.env.REFRESH_TOKEN_PEPPER ?? "dev-refresh-pepper",
    OTP_DEV_BYPASS: parseOtpDevBypass(process.env.OTP_DEV_BYPASS),
    CALCOM_WEBHOOK_SECRET: process.env.CALCOM_WEBHOOK_SECRET ?? "",
    POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET ?? "",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? "http://localhost:8081",
    HEALTH_STAFF_API_KEY: process.env.HEALTH_STAFF_API_KEY ?? "",
  };
}

export const env = loadEnv();
