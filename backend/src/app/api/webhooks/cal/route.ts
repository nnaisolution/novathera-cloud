import { json } from "@/lib/http/cors";
import { env } from "@/config/env";
import { upsertCalBooking } from "@/integrations/calcom/client";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const signature = req.headers.get("x-cal-signature-256") ?? "";
  if (env.APP_ENV === "production" && !env.CALCOM_WEBHOOK_SECRET) {
    return json({ error: "misconfigured" }, { status: 500, origin });
  }
  if (env.CALCOM_WEBHOOK_SECRET && !signature) {
    return json({ error: "unauthorized" }, { status: 401, origin });
  }
  const payload = await req.json().catch(() => null);
  await upsertCalBooking(payload);
  logger.info("cal_webhook_received");
  return json({ received: true }, { origin });
}
