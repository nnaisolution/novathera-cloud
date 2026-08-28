import { joinWaitlistInput } from "@/components/features/waitlist/schemas/join-waitlist";
import { notifyAdmins } from "@/components/features/waitlist/services/notify-admins";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";
import { assertRateLimit } from "@/lib/trpc/rate-limit";

export const waitlistRouter = createTRPCRouter({
  join: baseProcedure.input(joinWaitlistInput).mutation(async ({ input }) => {
    assertRateLimit({
      key: `waitlist:${input.email.toLowerCase()}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (input.website) {
      return { ok: true as const };
    }
    const { website: _honeypot, ...payload } = input;
    await notifyAdmins(payload);
    return { ok: true as const };
  }),
});
