import { json } from "@/lib/http/cors";
import { env } from "@/config/env";
import { upsertPolarSubscription } from "@/integrations/polar/client";
import { logger } from "@/lib/logging/logger";

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const signature = req.headers.get("webhook-signature") ?? "";
  if (env.APP_ENV === "production" && !env.POLAR_WEBHOOK_SECRET) {
    return json({ error: "misconfigured" }, { status: 500, origin });
  }
  if (env.POLAR_WEBHOOK_SECRET && !signature) {
    return json({ error: "unauthorized" }, { status: 401, origin });
  }
  const payload = await req.json().catch(() => null);
  await upsertPolarSubscription(payload);
  logger.info("polar_webhook_received");
  return json({ received: true }, { origin });
}
