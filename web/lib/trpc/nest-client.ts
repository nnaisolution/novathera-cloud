"use client";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import superjson from "superjson";

import type { AppRouter } from "@/types/trpc/app-router";
import type { EcommerceTrpcProxy } from "@/types/trpc/ecommerce";

const { TRPCProvider: NestTRPCProvider, useTRPC } =
  createTRPCContext<AppRouter>();

export { NestTRPCProvider };

/** Generated AppRouter plus ecommerce procedures until trpc:sync catches up. */
export function useNestTrpc() {
  return useTRPC() as ReturnType<typeof useTRPC> & EcommerceTrpcProxy;
}

export function createNestTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/trpc`,
        transformer: superjson,
        fetch(input: RequestInfo | URL, options?: RequestInit) {
          return fetch(input, { ...options, credentials: "include" });
        },
      }),
    ],
  });
}
