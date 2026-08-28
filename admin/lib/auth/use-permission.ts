'use client'

import { useSession } from '@/lib/auth-client'
import { authClient } from '@/lib/auth-client'

export function usePermission(resource: string, action: string) {
  const { data: session } = useSession()
  const role = session?.user?.role ?? 'staff'

  const roleName = (typeof role === 'string' ? role.split(',')[0] : 'staff') as
    | 'admin'
    | 'manager'
    | 'staff'
    | 'receptionist'

  return authClient.admin.checkRolePermission({
    role: roleName,
    permissions: {
      [resource]: [action],
    },
  })
}
