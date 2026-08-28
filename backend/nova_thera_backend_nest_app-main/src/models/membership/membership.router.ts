import { protectedProcedure, router } from '../../trpc/trpc';
import { MembershipService } from './membership.service';
import { upgradePlanInputSchema } from './schemas/membership.schema';

export function createMembershipRouter(service: MembershipService) {
  return router({
    myGetCurrent: protectedProcedure.query(({ ctx }) =>
      service.getCurrentForUser(ctx.user.id),
    ),

    myUpgradePlan: protectedProcedure
      .input(upgradePlanInputSchema)
      .mutation(({ input, ctx }) =>
        service.upgradePlan(ctx.user.id, input.planId, ctx.headers),
      ),

    myManagePlan: protectedProcedure.mutation(({ ctx }) =>
      service.managePlan(ctx.user.id, ctx.headers),
    ),
  });
}
