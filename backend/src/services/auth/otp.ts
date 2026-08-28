import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { logger } from "../../lib/logging/logger";
import {
  decryptString,
  encryptString,
  hashOtp,
  hashPhone,
  hashRefreshToken,
  randomToken,
  safeEqual,
  sixDigitOtp,
} from "../../lib/crypto/secrets";
import { signAccessToken, signLinkToken } from "../../lib/http/jwt";
import { sendSms } from "../../integrations/sms/client";

const E164 = /^\+[1-9]\d{7,14}$/;
const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

/** Development-only code accepted when SMS is skipped. Never send via SMS. */
export const DEV_OTP_BYPASS_CODE = "000000";

/**
 * Skip real SMS when OTP_DEV_BYPASS is on, or whenever NODE_ENV is not production.
 * Production still requires an explicit bypass flag (env.ts refuses that combination).
 */
export function isOtpSmsBypassed(): boolean {
  return env.OTP_DEV_BYPASS === true || process.env.NODE_ENV !== "production";
}

export async function requestOtp(phoneE164: string, ipHash?: string) {
  if (!E164.test(phoneE164)) {
    throw new Error("INVALID_PHONE");
  }
  const phoneLookupHash = hashPhone(phoneE164);
  const challenge = await prisma.otpChallenge.create({
    data: {
      phoneLookupHash,
      phoneE164Encrypted: encryptString(phoneE164),
      codeHash: "pending",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      ipHash,
    },
  });
  const bypass = isOtpSmsBypassed();
  const code = bypass ? DEV_OTP_BYPASS_CODE : sixDigitOtp();
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { codeHash: hashOtp(code, challenge.id) },
  });
  if (bypass) {
    // Structured logger redacts keys matching /otp|code/; print so local login can proceed.
    console.info(`[otp-dev-bypass] challengeId=${challenge.id} ${code}`);
  } else {
    await sendSms(phoneE164, "Your Nova Thera verification code expires in 5 minutes.");
  }
  logger.info("otp_requested", { challengeId: challenge.id });
  return { challengeId: challenge.id };
}

export async function verifyOtp(challengeId: string, code: string) {
  const challenge = await prisma.otpChallenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.consumedAt || challenge.expiresAt < new Date()) {
    throw new Error("INVALID_CHALLENGE");
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw new Error("TOO_MANY_ATTEMPTS");
  }
  const expected = hashOtp(code, challenge.id);
  const ok =
    safeEqual(expected, challenge.codeHash) ||
    (isOtpSmsBypassed() && code === DEV_OTP_BYPASS_CODE);
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { attempts: { increment: 1 }, consumedAt: ok ? new Date() : undefined },
  });
  if (!ok) {
    throw new Error("INVALID_CODE");
  }

  let patient = await prisma.patient.findUnique({
    where: { phoneLookupHash: challenge.phoneLookupHash },
  });
  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        phoneLookupHash: challenge.phoneLookupHash,
        phoneE164Encrypted: challenge.phoneE164Encrypted,
      },
    });
  }

  const refreshToken = randomToken();
  await prisma.session.create({
    data: {
      patientId: patient.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  const accessToken = await signAccessToken(patient.id);
  // Short-lived hand-off credential the mobile app exchanges with the platform
  // API for a Better Auth session, so the phone number is only proven once.
  const linkToken = await signLinkToken(patient.id, decryptString(challenge.phoneE164Encrypted));
  logger.info("otp_verified", { patientId: patient.id });
  return {
    patientId: patient.id,
    accessToken,
    refreshToken,
    linkToken,
    expiresInSeconds: 15 * 60,
  };
}
