import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'
import { stripeClient } from '@better-auth/stripe/client'
import { ac, roles } from '@/lib/auth/permissions'
import { readSessionToken, writeSessionToken } from '@/lib/auth/session-token'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:4000',
  fetchOptions: {
    credentials: 'include',
    auth: {
      type: 'Bearer',
      token: () => readSessionToken() ?? undefined,
    },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get('set-auth-token')
      if (token) {
        writeSessionToken(token)
      }
    },
  },
  plugins: [
    adminClient({
      ac,
      roles,
    }),
    stripeClient(),
  ],
})

export const { signUp, signIn, signOut, useSession, sendVerificationEmail } = authClient
