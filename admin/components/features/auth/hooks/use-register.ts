'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/lib/auth/constants'
import type { RegisterFormValues } from '../schemas/register.schema'

/**
 * Creates an admin account through the open self-registration endpoint.
 *
 * The account is created with the admin role immediately. Whether the person
 * can then sign in depends on the API's email-verification setting, which the
 * response reports back.
 */
export function useRegister() {
  const router = useRouter()
  const trpc = useTRPC()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation(trpc.staff.selfRegisterAdmin.mutationOptions())

  const registerAdmin = async (values: RegisterFormValues) => {
    setError(null)

    try {
      const result = (await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)) as { requiresVerification?: boolean }

      if (result?.requiresVerification) {
        sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_KEY, values.email)
        router.push('/verify-email')
        return
      }

      router.push('/login?registered=1')
    } catch (mutationError) {
      setError(getTrpcErrorMessage(mutationError))
    }
  }

  return { registerAdmin, isPending: mutation.isPending, error }
}
