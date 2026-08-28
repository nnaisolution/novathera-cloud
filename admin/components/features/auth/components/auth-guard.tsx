'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

const STAFF_ROLES = new Set(['admin', 'manager', 'staff', 'receptionist'])

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if (isPending) {
      return
    }

    if (!session) {
      router.replace('/login')
      return
    }

    if (!session.user.emailVerified) {
      router.replace('/verify-email')
      return
    }

    const role = (session.user as { role?: string | null }).role
    if (!role || !STAFF_ROLES.has(role)) {
      router.replace('/login')
    }
  }, [isPending, router, session])

  if (isPending) {
    return (
      <div className='flex min-h-dvh items-center justify-center'>
        <p className='text-muted-foreground text-sm'>Loading...</p>
      </div>
    )
  }

  if (!session || !session.user.emailVerified) {
    return null
  }

  const role = (session.user as { role?: string | null }).role
  if (!role || !STAFF_ROLES.has(role)) {
    return null
  }

  return <>{children}</>
}
