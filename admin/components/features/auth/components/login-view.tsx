import SignIn from '@/components/shadcn-studio/blocks/signin-01/signin-01'
import { PublicAuthGuard } from './public-auth-guard'

export function LoginView() {
  return (
    <PublicAuthGuard>
      <SignIn />
    </PublicAuthGuard>
  )
}
