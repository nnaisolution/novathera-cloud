'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'

export type StaffFilters = {
  page: number
  limit: number
  search?: string
  role?: 'admin' | 'manager' | 'staff' | 'receptionist'
  includeCustomers: boolean
}

export function useStaffList(filters: StaffFilters) {
  const trpc = useTRPC()
  const canList = usePermission('user', 'list')

  const query = useQuery({
    ...trpc.staff.list.queryOptions({
      page: filters.page,
      limit: filters.limit,
      includeCustomers: filters.includeCustomers,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.role ? { role: filters.role } : {}),
    }),
    enabled: canList,
  })

  return { ...query, canList }
}

export function useRoleCounts() {
  const trpc = useTRPC()
  const canList = usePermission('user', 'list')

  return useQuery({
    ...trpc.staff.roleCounts.queryOptions(),
    enabled: canList,
  })
}

export function useUserSessions(userId: string | null) {
  const trpc = useTRPC()
  const canList = usePermission('session', 'list')

  return useQuery({
    ...trpc.staff.sessions.queryOptions({ userId: userId ?? '' }),
    enabled: canList && Boolean(userId),
  })
}

/**
 * Every staff mutation invalidates the same three queries, so they share one
 * hook rather than repeating the wiring six times.
 */
export function useStaffMutations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.staff.list.queryKey() }),
      queryClient.invalidateQueries({
        queryKey: trpc.staff.roleCounts.queryKey(),
      }),
      queryClient.invalidateQueries({ queryKey: trpc.staff.sessions.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.audit.list.queryKey() }),
    ])
  }

  const options = (message: string) => ({
    onSuccess: async () => {
      toast.success(message)
      await refresh()
    },
    onError: (error: { message: string }) => toast.error(error.message),
  })

  return {
    create: useMutation(
      trpc.staff.create.mutationOptions(options('Account created')),
    ),
    setRole: useMutation(
      trpc.staff.setRole.mutationOptions(options('Role updated')),
    ),
    ban: useMutation(trpc.staff.ban.mutationOptions(options('Account suspended'))),
    unban: useMutation(
      trpc.staff.unban.mutationOptions(options('Account restored')),
    ),
    setPassword: useMutation(
      trpc.staff.setPassword.mutationOptions(options('Password reset')),
    ),
    revokeSession: useMutation(
      trpc.staff.revokeSession.mutationOptions(options('Session revoked')),
    ),
    revokeAllSessions: useMutation(
      trpc.staff.revokeAllSessions.mutationOptions(
        options('Signed out of every device'),
      ),
    ),
    remove: useMutation(
      trpc.staff.remove.mutationOptions(options('Account deleted')),
    ),
  }
}
