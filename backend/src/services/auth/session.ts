import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logging/logger";
import { hashRefreshToken, randomToken } from "../../lib/crypto/secrets";
import { signAccessToken } from "../../lib/http/jwt";

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export async function refreshSession(refreshToken: string) {
  const existing = await prisma.session.findUnique({
    where: { refreshTokenHash: hashRefreshToken(refreshToken) },
  });
  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const nextRefreshToken = randomToken();
  // Revoking the old row and issuing the replacement in one transaction keeps a
  // stolen token from being usable if the second write fails.
  await prisma.$transaction([
    prisma.session.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    }),
    prisma.session.create({
      data: {
        patientId: existing.patientId,
        refreshTokenHash: hashRefreshToken(nextRefreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        deviceLabel: existing.deviceLabel,
      },
    }),
  ]);

  const accessToken = await signAccessToken(existing.patientId);
  logger.info("session_refreshed", { patientId: existing.patientId });
  return { accessToken, refreshToken: nextRefreshToken, expiresInSeconds: 15 * 60 };
}
