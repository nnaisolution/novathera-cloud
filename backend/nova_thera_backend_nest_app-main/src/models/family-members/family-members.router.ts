import { protectedProcedure, router } from '../../trpc/trpc';
import { FamilyMembersService } from './family-members.service';
import {
  createFamilyMemberInputSchema,
  familyMemberIdInputSchema,
  updateFamilyMemberInputSchema,
} from './schemas/family-member.schema';

export function createFamilyMembersRouter(service: FamilyMembersService) {
  return router({
    myList: protectedProcedure.query(({ ctx }) =>
      service.listForOwner(ctx.user.id),
    ),

    myCreate: protectedProcedure
      .input(createFamilyMemberInputSchema)
      .mutation(({ input, ctx }) =>
        service.createForOwner(ctx.user.id, input),
      ),

    myUpdate: protectedProcedure
      .input(updateFamilyMemberInputSchema)
      .mutation(({ input, ctx }) =>
        service.updateForOwner(ctx.user.id, input),
      ),

    myDelete: protectedProcedure
      .input(familyMemberIdInputSchema)
      .mutation(({ input, ctx }) =>
        service.deleteForOwner(ctx.user.id, input.id),
      ),
  });
}
