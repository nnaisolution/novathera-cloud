'use client'

import {
  IconLock,
  IconLockOpen,
  IconLogin,
  IconMask,
  IconSettings,
  IconShieldOff,
  IconTrash,
  IconUserPlus,
  IconUserShield,
  type TablerIcon,
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'

const PAGE_SIZE = 25

const ACTION_META: Record<string, { label: string; icon: TablerIcon }> = {
  'auth.signed_in': { label: 'Signed in', icon: IconLogin },
  'auth.signed_out': { label: 'Signed out', icon: IconLogin },
  'auth.impersonation_started': { label: 'Impersonation started', icon: IconMask },
  'auth.impersonation_stopped': { label: 'Impersonation stopped', icon: IconMask },
  'user.created': { label: 'Account created', icon: IconUserPlus },
  'user.role_changed': { label: 'Role changed', icon: IconUserShield },
  'user.banned': { label: 'Account suspended', icon: IconLock },
  'user.unbanned': { label: 'Suspension lifted', icon: IconLockOpen },
  'user.password_reset': { label: 'Password reset', icon: IconShieldOff },
  'user.deleted': { label: 'Account deleted', icon: IconTrash },
  'user.email_changed': { label: 'Account updated', icon: IconUserShield },
  'session.revoked': { label: 'Session revoked', icon: IconShieldOff },
  'settings.updated': { label: 'Settings updated', icon: IconSettings },
}

export function AuditView() {
  const trpc = useTRPC()
  const canRead = usePermission('audit', 'read')

  const [page, setPage] = useState(1)
  const [action, setAction] = useState('all')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    ...trpc.audit.list.queryOptions({
      page,
      limit: PAGE_SIZE,
      ...(action !== 'all' ? { action: action as never } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    }),
    enabled: canRead,
  })

  if (!canRead) {
    return (
      <Alert>
        <AlertTitle>No access</AlertTitle>
        <AlertDescription>Your role cannot view the audit log.</AlertDescription>
      </Alert>
    )
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-wrap items-center gap-2'>
        <Input
          placeholder='Search summary, actor or target…'
          className='max-w-xs'
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
        />
        <Select
          value={action}
          onValueChange={(value) => {
            setAction(value ?? 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className='w-56'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All activity</SelectItem>
            {Object.entries(ACTION_META).map(([key, meta]) => (
              <SelectItem key={key} value={key}>
                {meta.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className='ring-foreground/10 shadow-none ring-1'>
        <CardContent className='space-y-1'>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className='h-14 w-full rounded-lg' />
            ))
          ) : !data || data.items.length === 0 ? (
            <p className='text-muted-foreground py-12 text-center text-sm'>
              Nothing recorded yet for these filters.
            </p>
          ) : (
            data.items.map((entry) => {
              const meta = ACTION_META[entry.action]
              const Icon = meta?.icon ?? IconSettings

              return (
                <div
                  key={entry.id}
                  className='hover:bg-muted/50 flex items-start gap-3 rounded-lg p-3 transition-colors'
                >
                  <div className='bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-sm'>
                    <Icon className='size-4' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-sm font-medium'>
                        {entry.summary}
                      </span>
                      <Badge variant='outline' className='text-xs'>
                        {meta?.label ?? entry.action}
                      </Badge>
                    </div>
                    <p className='text-muted-foreground mt-0.5 text-xs'>
                      {entry.actorEmail ?? entry.actorUserId ?? 'system'}
                      {entry.actorRole ? ` · ${entry.actorRole}` : ''}
                      {entry.ipAddress ? ` · ${entry.ipAddress}` : ''}
                    </p>
                  </div>

                  <span className='text-muted-foreground shrink-0 text-xs tabular-nums'>
                    {new Date(entry.createdAt).toLocaleString('en-CA')}
                  </span>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className='flex items-center justify-between'>
          <p className='text-muted-foreground text-sm'>
            Page {page} of {totalPages} · {data?.total} entries
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
    </div>
  )
}
