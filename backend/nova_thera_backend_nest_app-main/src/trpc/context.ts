import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { fromNodeHeaders } from 'better-auth/node';
import type { AuthService } from '@thallesp/nestjs-better-auth';
import type { AuthInstance } from '../authentication/auth.factory';

export type TrpcContext = {
  session: Awaited<
    ReturnType<AuthService<AuthInstance>['api']['getSession']>
  > | null;
  headers: Headers;
  authApi: AuthService<AuthInstance>['api'];
};

export function createTrpcContextFactory(
  authService: AuthService<AuthInstance>,
) {
  return async ({ req }: CreateExpressContextOptions): Promise<TrpcContext> => {
    const headers = fromNodeHeaders(req.headers);
    const session = await authService.api.getSession({ headers });

    return {
      session,
      headers,
      authApi: authService.api,
    };
  };
}
