import { permissionProcedure, router } from '../../trpc/trpc';
import { AnalyticsService } from './analytics.service';
import { analyticsRangeInputSchema } from './schemas/analytics.schema';
import type { TrpcContext } from '../../trpc/context';

type PermissionCheck = {
  authApi: TrpcContext['authApi'];
  headers: TrpcContext['headers'];
  userId: string;
};

async function can(
  { authApi, headers, userId }: PermissionCheck,
  resource: string,
  action: string,
) {
  const result = await authApi.userHasPermission({
    body: { userId, permissions: { [resource]: [action] } },
    headers,
  });
  return Boolean(result?.success);
}

export function createAnalyticsRouter(service: AnalyticsService) {
  return router({
    /** Revenue and growth. Admin/manager only — see `analytics` in permissions. */
    overview: permissionProcedure('analytics', 'read')
      .input(analyticsRangeInputSchema)
      .query(({ input }) => service.overview(input)),

    /**
     * Run-the-clinic panel. Gated on `booking:read` so staff and receptionists
     * get it too, then narrowed per-caller: sections the caller lacks
     * permission for come back null rather than being omitted, so the client
     * can tell "not allowed" apart from "nothing to show".
     */
    operations: permissionProcedure('booking', 'read').query(async ({ ctx }) => {
      const check: PermissionCheck = {
        authApi: ctx.authApi,
        headers: ctx.headers,
        userId: ctx.user.id,
      };

      const [orders, products, employees] = await Promise.all([
        can(check, 'order', 'read'),
        can(check, 'product', 'read'),
        can(check, 'employee', 'read'),
      ]);

      return service.operations({ orders, products, employees });
    }),
  });
}
