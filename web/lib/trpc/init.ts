import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

export type TRPCContext = Record<string, never>;

export const createTRPCContext = async (): Promise<TRPCContext> => ({});

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export { TRPCError };
