import { AuthGuard } from '@/components/features/auth'
import { DashboardShellLayout } from '@/components/features/dashboard-shell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShellLayout>{children}</DashboardShellLayout>
    </AuthGuard>
  )
}
