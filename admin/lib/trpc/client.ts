'use client'

import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import superjson from 'superjson'
import type { AppRouter } from '@/types/trpc/app-router'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/trpc`,
        transformer: superjson,
        fetch(input: RequestInfo | URL, options?: RequestInit) {
          return fetch(input, { ...options, credentials: 'include' })
        },
      }),
    ],
  })
}
