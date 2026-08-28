import { z } from "zod";
import { json } from "@/lib/http/cors";
import { DEV_OTP_BYPASS_CODE, isOtpSmsBypassed, verifyOtp } from "@/services/auth/otp";
import { logger } from "@/lib/logging/logger";

const bodySchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().length(6),
});

export async function OPTIONS(req: Request) {
  return json({}, { origin: req.headers.get("origin") });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: "invalid_request" }, { status: 400, origin });
  }
  try {
    if (isOtpSmsBypassed() && parsed.data.code === DEV_OTP_BYPASS_CODE) {
      console.info("[otp-dev-bypass] POST /api/auth/otp/verify accepting development code 000000");
    }
    const result = await verifyOtp(parsed.data.challengeId, parsed.data.code);
    return json(result, { origin });
  } catch {
    logger.warn("otp_verify_failed");
    return json({ error: "verification_failed" }, { status: 401, origin });
  }
}
