'use client'

import {
  IconDotsVertical,
  IconKey,
  IconLock,
  IconLockOpen,
  IconTrash,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/lib/auth/use-permission'
import { useSession } from '@/lib/auth-client'
import {
  useRoleCounts,
  useStaffList,
  useStaffMutations,
} from '@/components/features/staff/hooks/use-staff'
import { CreateStaffDialog } from '@/components/features/staff/components/create-staff-dialog'
import { SessionsDialog } from '@/components/features/staff/components/sessions-dialog'
import {
  BanDialog,
  ConfirmDialog,
  ResetPasswordDialog,
  type StaffTarget,
} from '@/components/features/staff/components/staff-action-dialogs'
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  isAssignableRole,
} from '@/components/features/staff/utils/roles'
import type { AssignableRole } from '@/components/features/staff/utils/roles'

const PAGE_SIZE = 20

export function StaffView() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const canList = usePermission('user', 'list')
  const canCreate = usePermission('user', 'create')
  const canSetRole = usePermission('user', 'set-role')
  const canBan = usePermission('user', 'ban')
  const canSetPassword = usePermission('user', 'set-password')
  const canDelete = usePermission('user', 'delete')
  const canListSessions = usePermission('session', 'list')

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [includeCustomers, setIncludeCustomers] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [banTarget, setBanTarget] = useState<StaffTarget | null>(null)
  const [passwordTarget, setPasswordTarget] = useState<StaffTarget | null>(null)
  const [sessionsTarget, setSessionsTarget] = useState<StaffTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StaffTarget | null>(null)
  const [unbanTarget, setUnbanTarget] = useState<StaffTarget | null>(null)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)

  const filters = {
    page,
    limit: PAGE_SIZE,
    includeCustomers,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(roleFilter !== 'all' && isAssignableRole(roleFilter)
      ? { role: roleFilter }
      : {}),
  }

  const { data, isLoading } = useStaffList(filters)
  const { data: roleCounts } = useRoleCounts()
  const mutations = useStaffMutations()

  if (!canList) {
    return (
      <Alert>
        <AlertTitle>No access</AlertTitle>
        <AlertDescription>
          Your role cannot view staff accounts.
        </AlertDescription>
      </Alert>
    )
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className='flex flex-col gap-6'>
      {canCreate ? (
        <div className='flex justify-end'>
          <Button onClick={() => setCreateOpen(true)}>
            <IconUserPlus className='size-4' />
            New account
          </Button>
        </div>
      ) : null}

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-5'>
        {(roleCounts ?? []).map((entry) => (
          <Card
            key={entry.role}
            className='ring-foreground/10 shadow-none ring-1'
          >
            <CardContent className='flex items-center gap-3'>
              <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm'>
                <IconUsers className='size-4' />
              </div>
              <div>
                <p className='text-xl font-semibold tabular-nums'>
                  {entry.count}
                </p>
                <p className='text-muted-foreground text-xs'>
                  {ROLE_LABELS[entry.role] ?? entry.role}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Search name or email…'
          className='max-w-xs'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value ?? 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className='w-44'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All staff roles</SelectItem>
            {ASSIGNABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={includeCustomers ? 'default' : 'outline'}
          onClick={() => {
            setIncludeCustomers((value) => !value)
            setPage(1)
          }}
        >
          {includeCustomers ? 'Including customers' : 'Staff only'}
        </Button>
      </div>

      <Card className='ring-foreground/10 shadow-none ring-1'>
        <CardContent className='px-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Sessions</TableHead>
                <TableHead className='w-12' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className='h-8 w-full' />
                    </TableCell>
                  </TableRow>
                ))
              ) : !data || data.items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-muted-foreground py-10 text-center text-sm'
                  >
                    No accounts match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                data.items.map((user) => {
                  const target: StaffTarget = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                  }
                  const isSelf = user.id === currentUserId

                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className='min-w-0'>
                          <p className='truncate font-medium'>
                            {user.name}
                            {isSelf ? (
                              <span className='text-muted-foreground ml-2 text-xs'>
                                (you)
                              </span>
                            ) : null}
                          </p>
                          <p className='text-muted-foreground truncate text-xs'>
                            {user.email}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {canSetRole && !isSelf && isAssignableRole(user.role) ? (
                          <Select
                            value={user.role}
                            onValueChange={(role) =>
                              mutations.setRole.mutate({
                                userId: user.id,
                                role: role as AssignableRole,
                              })
                            }
                          >
                            <SelectTrigger className='h-8 w-36'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {ROLE_LABELS[role]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant='secondary'>
                            {ROLE_LABELS[user.role ?? ''] ?? user.role ?? '—'}
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        {user.banned ? (
                          <Badge variant='destructive'>
                            Suspended
                            {user.banExpires
                              ? ` until ${new Date(user.banExpires).toLocaleDateString('en-CA')}`
                              : ''}
                          </Badge>
                        ) : user.emailVerified ? (
                          <Badge variant='secondary'>Active</Badge>
                        ) : (
                          <Badge variant='outline'>Unverified</Badge>
                        )}
                        {user.banReason ? (
                          <p className='text-muted-foreground mt-1 max-w-48 truncate text-xs'>
                            {user.banReason}
                          </p>
                        ) : null}
                      </TableCell>

                      <TableCell className='text-right tabular-nums'>
                        {canListSessions ? (
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setSessionsTarget(target)}
                          >
                            {user.activeSessions}
                          </Button>
                        ) : (
                          user.activeSessions
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant='ghost' size='icon' />}
                          >
                            <IconDotsVertical className='size-4' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            {canSetPassword ? (
                              <DropdownMenuItem
                                onClick={() => setPasswordTarget(target)}
                              >
                                <IconKey className='size-4' />
                                Reset password
                              </DropdownMenuItem>
                            ) : null}

                            {canBan && !isSelf ? (
                              user.banned ? (
                                <DropdownMenuItem
                                  onClick={() => setUnbanTarget(target)}
                                >
                                  <IconLockOpen className='size-4' />
                                  Lift suspension
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => setBanTarget(target)}
                                >
                                  <IconLock className='size-4' />
                                  Suspend account
                                </DropdownMenuItem>
                              )
                            ) : null}

                            {canDelete && !isSelf ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant='destructive'
                                  onClick={() => setDeleteTarget(target)}
                                >
                                  <IconTrash className='size-4' />
                                  Delete account
                                </DropdownMenuItem>
                              </>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Page {page} of {totalPages} · {data?.total} account
            {data?.total === 1 ? '' : 's'}
          </p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CreateStaffDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        pending={mutations.create.isPending}
        onSubmit={(input) =>
          mutations.create.mutate(input, {
            onSuccess: () => setCreateOpen(false),
          })
        }
      />

      <BanDialog
        target={banTarget}
        onOpenChange={(open) => !open && setBanTarget(null)}
        pending={mutations.ban.isPending}
        onSubmit={(input) =>
          banTarget &&
          mutations.ban.mutate(
            { userId: banTarget.id, ...input },
            { onSuccess: () => setBanTarget(null) },
          )
        }
      />

      <ResetPasswordDialog
        target={passwordTarget}
        onOpenChange={(open) => !open && setPasswordTarget(null)}
        pending={mutations.setPassword.isPending}
        onSubmit={(newPassword) =>
          passwordTarget &&
          mutations.setPassword.mutate(
            { userId: passwordTarget.id, newPassword },
            { onSuccess: () => setPasswordTarget(null) },
          )
        }
      />

      <SessionsDialog
        target={sessionsTarget}
        onOpenChange={(open) => !open && setSessionsTarget(null)}
        revokingToken={revokingToken}
        revokingAll={mutations.revokeAllSessions.isPending}
        onRevoke={(sessionToken) => {
          if (!sessionsTarget) return
          setRevokingToken(sessionToken)
          mutations.revokeSession.mutate(
            { sessionToken, userId: sessionsTarget.id },
            { onSettled: () => setRevokingToken(null) },
          )
        }}
        onRevokeAll={() =>
          sessionsTarget &&
          mutations.revokeAllSessions.mutate(
            { userId: sessionsTarget.id },
            { onSuccess: () => setSessionsTarget(null) },
          )
        }
      />

      <ConfirmDialog
        open={Boolean(unbanTarget)}
        title={`Lift suspension for ${unbanTarget?.name}?`}
        description='They will be able to sign in again immediately.'
        confirmLabel='Lift suspension'
        pending={mutations.unban.isPending}
        onOpenChange={(open) => !open && setUnbanTarget(null)}
        onConfirm={() =>
          unbanTarget &&
          mutations.unban.mutate(
            { userId: unbanTarget.id },
            { onSuccess: () => setUnbanTarget(null) },
          )
        }
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.name}?`}
        description={`This permanently removes ${deleteTarget?.email} and their sessions. Audit history is kept. This cannot be undone.`}
        confirmLabel='Delete account'
        destructive
        pending={mutations.remove.isPending}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={() =>
          deleteTarget &&
          mutations.remove.mutate(
            { userId: deleteTarget.id },
            { onSuccess: () => setDeleteTarget(null) },
          )
        }
      />
    </div>
  )
}
