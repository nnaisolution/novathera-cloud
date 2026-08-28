import { z } from "zod";
import { json } from "@/lib/http/cors";
import { isOtpSmsBypassed, requestOtp } from "@/services/auth/otp";
import { logger } from "@/lib/logging/logger";

const bodySchema = z.object({
  phoneE164: z.string(),
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
    if (isOtpSmsBypassed()) {
      console.info(
        "[otp-dev-bypass] POST /api/auth/otp/request skipping SMS (OTP_DEV_BYPASS or NODE_ENV!==production)",
      );
    }
    const result = await requestOtp(parsed.data.phoneE164);
    return json(result, { origin });
  } catch (error) {
    logger.warn("otp_request_failed");
    const code = error instanceof Error && error.message === "INVALID_PHONE" ? 400 : 500;
    return json({ error: "otp_request_failed" }, { status: code, origin });
  }
}
