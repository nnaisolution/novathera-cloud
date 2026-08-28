import { contactRouter } from "@/components/features/contact-us/trpc/router";
import { waitlistRouter } from "@/components/features/waitlist/trpc/router";
import { createTRPCRouter } from "@/lib/trpc/init";

export const appRouter = createTRPCRouter({
  contact: contactRouter,
  waitlist: waitlistRouter,
});

export type AppRouter = typeof appRouter;
