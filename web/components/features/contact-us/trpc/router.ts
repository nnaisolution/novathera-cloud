import { sendContactMessage } from "@/components/features/contact-us/services/send-contact-message";
import { submitContactInput } from "@/components/features/contact-us/schemas/submit-contact";
import { baseProcedure, createTRPCRouter } from "@/lib/trpc/init";
import { assertRateLimit } from "@/lib/trpc/rate-limit";

export const contactRouter = createTRPCRouter({
  submit: baseProcedure
    .input(submitContactInput)
    .mutation(async ({ input }) => {
      assertRateLimit({
        key: `contact:${input.email.toLowerCase()}`,
        limit: 5,
        windowMs: 60 * 60 * 1000,
      });
      if (input.website) {
        return { ok: true as const };
      }
      const { website: _honeypot, ...payload } = input;
      await sendContactMessage(payload);
      return { ok: true as const };
    }),
});
