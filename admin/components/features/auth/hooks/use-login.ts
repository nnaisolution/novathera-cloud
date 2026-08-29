'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { writeSessionToken } from '@/lib/auth/session-token'
import { getAppUrl, PENDING_VERIFICATION_EMAIL_KEY } from '@/lib/auth/constants'
import type { LoginFormValues } from '../schemas/login.schema'

export function useLogin() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (values: LoginFormValues) => {
    setIsPending(true)
    setError(null)

    let signInError: { message?: string; status?: number } | null = null

    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: `${getAppUrl()}/`,
      })
      signInError = result.error
      const token = result.data?.token
      if (typeof token === 'string' && token) {
        writeSessionToken(token)
      }
    } catch {
      setIsPending(false)
      setError(
        'Unable to reach the authentication server. Ensure the backend is running on port 4000.',
      )
      return
    }

    setIsPending(false)

    if (signInError) {
      if (signInError.status === 403) {
        sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, values.email)
        router.push('/verify-email')
        return
      }

      setError(signInError.message ?? 'Invalid email or password. Please try again.')
      return
    }

    router.push('/')
  }

  return { login, isPending, error }
}
