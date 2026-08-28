import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import type { TrpcContext } from './context';

function formatZodMessage(cause: ZodError) {
  const issues = cause.issues;
  if (issues.length === 0) return 'Invalid input';
  if (issues.length === 1) return issues[0].message;
  return issues.map((issue) => issue.message).join('. ');
}

function friendlyTrpcMessage(
  code: TRPCError['code'],
  message: string,
  cause: unknown,
) {
  if (cause instanceof ZodError) {
    return formatZodMessage(cause);
  }

  if (code === 'FORBIDDEN') {
    return message && message !== 'FORBIDDEN'
      ? message
      : "You don't have permission to perform this action";
  }

  if (code === 'UNAUTHORIZED') {
    return message && message !== 'UNAUTHORIZED'
      ? message
      : 'Please sign in to continue';
  }

  if (code === 'INTERNAL_SERVER_ERROR') {
    return 'An unexpected error occurred';
  }

  return message;
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError =
      error.cause instanceof ZodError ? error.cause.flatten() : null;

    return {
      ...shape,
      message: friendlyTrpcMessage(error.code, shape.message, error.cause),
      data: {
        ...shape.data,
        zodError,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

export function permissionProcedure(resource: string, action: string) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const result = await ctx.authApi.userHasPermission({
      body: {
        userId: ctx.user.id,
        permissions: {
          [resource]: [action],
        },
      },
      headers: ctx.headers,
    });

    if (!result?.success) {
      throw new TRPCError({ code: 'FORBIDDEN' });
    }

    return next({ ctx });
  });
}
