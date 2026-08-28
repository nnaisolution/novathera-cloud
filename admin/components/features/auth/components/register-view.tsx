import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import AuthBackgroundShape from '@/assets/svg/auth-background-shape'
import { PublicAuthGuard } from '@/components/features/auth/components/public-auth-guard'
import { RegisterForm } from '@/components/features/auth/components/register-form'
import Logo from '@/components/shadcn-studio/logo'

export function RegisterView() {
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
                Create an admin account
              </CardTitle>
              <CardDescription className='text-base'>
                This account has full access to the dashboard, including
                customer records and documents.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className='px-6'>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </PublicAuthGuard>
  )
}
