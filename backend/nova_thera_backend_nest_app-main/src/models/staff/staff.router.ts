import { auditActor } from '../../common/helpers/audit-actor';
import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { AuditService } from '../audit/audit.service';
import { StaffService } from './staff.service';
import {
  banUserInputSchema,
  createStaffInputSchema,
  listStaffInputSchema,
  revokeSessionInputSchema,
  selfRegisterAdminInputSchema,
  setPasswordInputSchema,
  setRoleInputSchema,
  userIdInputSchema,
} from './schemas/staff.schema';

export function createStaffRouter(service: StaffService, audit: AuditService) {
  return router({
    /**
     * Open admin registration — intentionally unauthenticated.
     *
     * SECURITY: no permission gate. Anyone able to POST here receives a full
     * admin account with access to customer health documents. Disable with
     * ADMIN_SELF_SIGNUP_ENABLED=false. Every use is recorded in the audit log
     * with the caller's IP so abuse is at least visible after the fact.
     */
    selfRegisterAdmin: publicProcedure
      .input(selfRegisterAdminInputSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await service.selfRegisterAdmin(input, ctx.headers);

        await audit.record({
          actorUserId: result.id,
          actorEmail: result.email,
          actorRole: 'admin',
          ipAddress:
            ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            ctx.headers.get('x-real-ip') ??
            null,
          userAgent: ctx.headers.get('user-agent'),
          action: 'user.self_registered_admin',
          targetType: 'user',
          targetId: result.id,
          targetLabel: result.email,
          summary: `Self-registered an admin account via the open signup page: ${result.email}`,
          metadata: { role: 'admin', selfService: true },
        });

        return result;
      }),

    list: permissionProcedure('user', 'list')
      .input(listStaffInputSchema)
      .query(({ input }) => service.list(input)),

    roleCounts: permissionProcedure('user', 'list').query(() =>
      service.roleCounts(),
    ),

    sessions: permissionProcedure('session', 'list')
      .input(userIdInputSchema)
      .query(({ input }) => service.sessions(input.userId)),

    create: permissionProcedure('user', 'create')
      .input(createStaffInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.create(input, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'user.created',
          targetType: 'user',
          targetId: user.id,
          targetLabel: input.email,
          summary: `Created ${input.role} account for ${input.email}`,
          metadata: { role: input.role },
        });

        return user;
      }),

    setRole: permissionProcedure('user', 'set-role')
      .input(setRoleInputSchema)
      .mutation(async ({ input, ctx }) => {
        const result = await service.setRole(input, ctx.user.id, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'user.role_changed',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: result.email,
          summary: `Changed ${result.email} from ${result.previousRole ?? 'none'} to ${input.role}`,
          metadata: { from: result.previousRole, to: input.role },
        });

        return result;
      }),

    ban: permissionProcedure('user', 'ban')
      .input(banUserInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.ban(input, ctx.user.id, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'user.banned',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          summary: `Suspended ${user.email}${
            input.expiresInDays
              ? ` for ${input.expiresInDays} day(s)`
              : ' indefinitely'
          } — ${input.reason}`,
          metadata: {
            reason: input.reason,
            expiresInDays: input.expiresInDays,
          },
        });

        return user;
      }),

    unban: permissionProcedure('user', 'ban')
      .input(userIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.unban(input.userId, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'user.unbanned',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          summary: `Restored access for ${user.email}`,
        });

        return user;
      }),

    setPassword: permissionProcedure('user', 'set-password')
      .input(setPasswordInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.setPassword(input, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'user.password_reset',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          // The password itself is never recorded.
          summary: `Reset the password for ${user.email}`,
        });

        return { success: true };
      }),

    revokeSession: permissionProcedure('session', 'revoke')
      .input(revokeSessionInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.revokeSession(
          input.sessionToken,
          input.userId,
          ctx.headers,
        );

        await audit.record({
          ...auditActor(ctx),
          action: 'session.revoked',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          summary: `Revoked a session for ${user.email}`,
        });

        return { success: true };
      }),

    revokeAllSessions: permissionProcedure('session', 'revoke')
      .input(userIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.revokeAllSessions(input.userId, ctx.headers);

        await audit.record({
          ...auditActor(ctx),
          action: 'session.revoked',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          summary: `Signed ${user.email} out of every device`,
        });

        return { success: true };
      }),

    remove: permissionProcedure('user', 'delete')
      .input(userIdInputSchema)
      .mutation(async ({ input, ctx }) => {
        const user = await service.remove(
          input.userId,
          ctx.user.id,
          ctx.headers,
        );

        await audit.record({
          ...auditActor(ctx),
          action: 'user.deleted',
          targetType: 'user',
          targetId: input.userId,
          targetLabel: user.email,
          summary: `Deleted the account ${user.email}`,
          metadata: { role: user.role },
        });

        return { success: true };
      }),
  });
}
