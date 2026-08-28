import { protectedProcedure, router } from '../../trpc/trpc';
import { CheckoutService } from './checkout.service';
import { createCheckoutSessionInputSchema } from './schemas/checkout.schema';

export function createCheckoutRouter(service: CheckoutService) {
  return router({
    createSession: protectedProcedure
      .input(createCheckoutSessionInputSchema)
      .mutation(({ ctx }) => service.createSession(ctx.user.id)),
  });
}
