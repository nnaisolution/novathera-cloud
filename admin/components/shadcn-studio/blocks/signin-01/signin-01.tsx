import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import Link from 'next/link'

import AuthBackgroundShape from '@/assets/svg/auth-background-shape'
import { LoginForm } from '@/components/features/auth'
import Logo from '@/components/shadcn-studio/logo'

const SignIn = () => {
  return (
    <div className='relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8'>
      <div className='absolute'>
        <AuthBackgroundShape />
      </div>

      <Card className='z-1 w-full gap-6 py-6 sm:max-w-lg'>
        <CardHeader className='gap-6 px-6'>
          <Logo className='gap-3' />

          <div>
            <CardTitle className='mb-2 text-2xl font-semibold'>
              Sign in to Nova Thera
            </CardTitle>
            <CardDescription className='text-base'>
              Welcome back. Sign in to access your admin dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='px-6'>
          <div className='space-y-4'>
            <LoginForm />

            <p className='text-muted-foreground text-center text-sm'>
              Need an account?{' '}
              <Link
                href='/register'
                className='text-foreground font-medium underline'
              >
                Create one
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn
