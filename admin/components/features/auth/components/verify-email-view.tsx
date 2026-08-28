'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthBackgroundShape from '@/assets/svg/auth-background-shape'
import Logo from '@/components/shadcn-studio/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PENDING_VERIFICATION_EMAIL_KEY } from '@/lib/auth/constants'
import { useVerifyEmail } from '../hooks/use-verify-email'
import { PublicAuthGuard } from './public-auth-guard'

export function VerifyEmailView() {
  const { resendVerificationEmail, isResending } = useVerifyEmail()
  const [email, setEmail] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailFromQuery = params.get('email')
    const emailFromStorage = sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_KEY)
    setEmail(emailFromQuery ?? emailFromStorage ?? '')
  }, [])

  return (
    <PublicAuthGuard>
      <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
        <div className='absolute'>
          <AuthBackgroundShape />
        </div>

        <Card className='z-1 w-full gap-6 py-6 sm:max-w-lg'>
          <CardHeader className='gap-6 px-6'>
            <Logo className='gap-3' />
            <div>
              <CardTitle className='mb-2 text-2xl font-semibold'>Verify your email</CardTitle>
              <CardDescription className='text-base'>
                We sent a verification link to your email. Click the link to access your dashboard.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 px-6'>
            {email ? (
              <p className='text-muted-foreground text-sm'>
                Verification email sent to{' '}
                <span className='text-foreground font-medium'>{email}</span>
              </p>
            ) : (
              <p className='text-muted-foreground text-sm'>
                Check your inbox for the verification link.
              </p>
            )}

            <Button
              className='w-full'
              variant='outline'
              disabled={isResending || !email}
              onClick={() => resendVerificationEmail(email)}
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Button>

            <p className='text-muted-foreground text-center text-sm'>
              Wrong email?{' '}
              <Link href='/login' className='text-card-foreground hover:underline'>
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicAuthGuard>
  )
}
