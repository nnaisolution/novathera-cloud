import { z } from "zod";
import { json } from "@/lib/http/cors";
import { refreshSession } from "@/services/auth/session";
import { logger } from "@/lib/logging/logger";

const bodySchema = z.object({
  refreshToken: z.string().min(1),
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
    const result = await refreshSession(parsed.data.refreshToken);
    return json(result, { origin });
  } catch {
    logger.warn("session_refresh_failed");
    return json({ error: "refresh_failed" }, { status: 401, origin });
  }
}
