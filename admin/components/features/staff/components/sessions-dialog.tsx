'use client'

import { IconDeviceDesktop, IconLoader2, IconMask } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserSessions } from '@/components/features/staff/hooks/use-staff'
import type { StaffTarget } from '@/components/features/staff/components/staff-action-dialogs'

/** Turns a UA string into something a human can scan in a table. */
function describeAgent(userAgent: string | null) {
  if (!userAgent) return 'Unknown device'
  const browser =
    /Edg\//.test(userAgent) ? 'Edge'
    : /Chrome\//.test(userAgent) ? 'Chrome'
    : /Safari\//.test(userAgent) ? 'Safari'
    : /Firefox\//.test(userAgent) ? 'Firefox'
    : 'Browser'
  const os =
    /Windows/.test(userAgent) ? 'Windows'
    : /Macintosh|Mac OS/.test(userAgent) ? 'macOS'
    : /Android/.test(userAgent) ? 'Android'
    : /iPhone|iPad/.test(userAgent) ? 'iOS'
    : /Linux/.test(userAgent) ? 'Linux'
    : 'Unknown OS'
  return `${browser} on ${os}`
}

export function SessionsDialog({
  target,
  onOpenChange,
  revokingToken,
  revokingAll,
  onRevoke,
  onRevokeAll,
}: {
  target: StaffTarget | null
  onOpenChange: (open: boolean) => void
  revokingToken: string | null
  revokingAll: boolean
  onRevoke: (sessionToken: string) => void
  onRevokeAll: () => void
}) {
  const { data, isLoading } = useUserSessions(target?.id ?? null)

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Active sessions — {target?.name}</DialogTitle>
          <DialogDescription>
            Every device currently signed in as this account.
          </DialogDescription>
        </DialogHeader>

        <div className='max-h-80 space-y-2 overflow-y-auto'>
          {isLoading ? (
            <>
              <Skeleton className='h-16 w-full rounded-lg' />
              <Skeleton className='h-16 w-full rounded-lg' />
            </>
          ) : !data || data.length === 0 ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No active sessions. This account is not signed in anywhere.
            </p>
          ) : (
            data.map((session) => (
              <div
                key={session.id}
                className='ring-foreground/10 flex items-center gap-3 rounded-lg p-3 ring-1'
              >
                <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm'>
                  {session.impersonatedBy ? (
                    <IconMask className='size-4' />
                  ) : (
                    <IconDeviceDesktop className='size-4' />
                  )}
                </div>

                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {describeAgent(session.userAgent)}
                    {session.impersonatedBy ? (
                      <Badge variant='secondary' className='ml-2'>
                        Impersonated
                      </Badge>
                    ) : null}
                  </p>
                  <p className='text-muted-foreground truncate text-xs'>
                    {session.ipAddress ?? 'No IP recorded'} · started{' '}
                    {new Date(session.createdAt).toLocaleString('en-CA')} ·
                    expires {new Date(session.expiresAt).toLocaleDateString('en-CA')}
                  </p>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  disabled={revokingToken === session.token}
                  onClick={() => onRevoke(session.token)}
                >
                  {revokingToken === session.token ? (
                    <IconLoader2 className='size-4 animate-spin' />
                  ) : (
                    'Revoke'
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant='destructive'
            disabled={revokingAll || !data || data.length === 0}
            onClick={onRevokeAll}
          >
            {revokingAll ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Revoking
              </>
            ) : (
              'Sign out everywhere'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
