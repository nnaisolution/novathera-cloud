import { TRPCError } from '@trpc/server';
import { Prisma } from 'generated/prisma/client';

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'A record with this value already exists',
      });
    }
    if (error.code === 'P2025') {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Record not found',
      });
    }
  }

  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
  });
}
