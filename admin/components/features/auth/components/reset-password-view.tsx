import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import AuthBackgroundShape from '@/assets/svg/auth-background-shape'
import { ResetPasswordForm } from '@/components/features/auth/components/reset-password-form'
import { PublicAuthGuard } from '@/components/features/auth/components/public-auth-guard'
import Logo from '@/components/shadcn-studio/logo'

export function ResetPasswordView() {
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
              <CardTitle className='mb-2 text-2xl font-semibold'>
                Reset password
              </CardTitle>
              <CardDescription className='text-base'>
                Choose a new password for your admin account.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='px-6'>
            <Suspense
              fallback={
                <p className='text-muted-foreground text-sm'>Loading...</p>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </PublicAuthGuard>
  )
}
