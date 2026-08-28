import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createIpRateLimiter } from './common/rate-limit';
import { MOBILE_SESSION_EXCHANGE_PATH } from './mobile/mobile-session.constants';
import type { AppRouter } from './trpc/app.router';
import type { TrpcContext } from './trpc/context';
import { TRPC_CONTEXT_FACTORY, TRPC_ROUTER } from './trpc/trpc.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use(helmet());
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';

  // Cloud Run (and any load balancer) terminates TLS and forwards the caller's
  // address in x-forwarded-for. Without this, Express reports the balancer's IP
  // for every request, which would collapse the per-IP rate limiters into one
  // shared bucket and record the wrong address on every audit entry.
  //
  // The hop count is 1 for a plain Cloud Run service; add one per additional
  // proxy in front of it (e.g. an external HTTPS load balancer or Cloud Armor).
  const proxyHops = Number(
    configService.get<string>('TRUSTED_PROXY_HOPS') ?? 1,
  );
  if (isProduction || process.env.TRUSTED_PROXY_HOPS) {
    const expressInstance = app.getHttpAdapter().getInstance() as {
      set: (key: string, value: unknown) => void;
    };
    expressInstance.set('trust proxy', proxyHops);
  }

  const secret = configService.get<string>('BETTER_AUTH_SECRET');
  const trustedOriginsRaw = configService.get<string>(
    'BETTER_AUTH_TRUSTED_ORIGINS',
    '',
  );
  const trustedOrigins = trustedOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (isProduction) {
    if (!secret) {
      throw new Error('BETTER_AUTH_SECRET must be set in production');
    }
    if (trustedOrigins.length === 0) {
      throw new Error('BETTER_AUTH_TRUSTED_ORIGINS must be set in production');
    }
  }

  if (trustedOrigins.length > 0) {
    app.enableCors({
      origin: trustedOrigins,
      credentials: true,
    });
  } else if (isProduction) {
    throw new Error('CORS trusted origins are required in production');
  }

  const trpcRouter = app.get<AppRouter>(TRPC_ROUTER);
  const createContext =
    app.get<(opts: unknown) => Promise<TrpcContext>>(TRPC_CONTEXT_FACTORY);

  const httpAdapter = app.getHttpAdapter();
  // Open admin registration needs a far tighter budget than ordinary calls —
  // the shared 240/min allowance would let one IP mint hundreds of admin
  // accounts a minute. Registered before the general limiter so it wins.
  httpAdapter.use(
    '/trpc/staff.selfRegisterAdmin',
    createIpRateLimiter(3, 60 * 60_000),
  );
  httpAdapter.use('/trpc', createIpRateLimiter(240, 60_000));

  // The mobile session exchange mints a full platform session from a phone
  // proof, so it gets a budget of its own rather than the shared allowance.
  // Registered here, before Nest mounts its router, so it runs ahead of the
  // controller.
  httpAdapter.use(
    MOBILE_SESSION_EXCHANGE_PATH,
    createIpRateLimiter(10, 5 * 60_000),
  );
  httpAdapter.use(
    '/trpc',
    createExpressMiddleware({
      router: trpcRouter,
      createContext: createContext as never,
    }),
  );

  // Loud on every boot: this one is easy to leave on by accident, and the cost
  // of doing so is anonymous admin access to customer health records.
  if (process.env.ADMIN_SELF_SIGNUP_ENABLED !== 'false') {
    new Logger('Security').warn(
      'OPEN ADMIN SIGNUP IS ENABLED — anyone who can reach the admin app /register ' +
        'page can create an admin account with access to customer health documents. ' +
        'Set ADMIN_SELF_SIGNUP_ENABLED=false to disable it.',
    );
  }

  const port = Number(process.env.PORT ?? configService.get<string | number>('PORT') ?? 4000);
  await app.listen(port, '0.0.0.0');
}
void bootstrap();
