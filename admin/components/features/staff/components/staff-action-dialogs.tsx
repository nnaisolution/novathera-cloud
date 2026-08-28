'use client'

import { IconLoader2 } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type StaffTarget = { id: string; name: string; email: string }

/** Suspend an account, with an optional automatic expiry. */
export function BanDialog({
  target,
  onOpenChange,
  pending,
  onSubmit,
}: {
  target: StaffTarget | null
  onOpenChange: (open: boolean) => void
  pending: boolean
  onSubmit: (input: { reason: string; expiresInDays?: number }) => void
}) {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('permanent')

  useEffect(() => {
    if (target) {
      setReason('')
      setDuration('permanent')
    }
  }, [target])

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {target?.name}</DialogTitle>
          <DialogDescription>
            They will be signed out immediately and cannot sign in again until
            the suspension is lifted.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='ban-reason'>Reason</Label>
            <Input
              id='ban-reason'
              value={reason}
              placeholder='Why is this account being suspended?'
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='ban-duration'>Duration</Label>
            <Select
              value={duration}
              onValueChange={(value) => setDuration(value ?? 'permanent')}
            >
              <SelectTrigger id='ban-duration' className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='permanent'>Until manually lifted</SelectItem>
                <SelectItem value='1'>1 day</SelectItem>
                <SelectItem value='7'>7 days</SelectItem>
                <SelectItem value='30'>30 days</SelectItem>
                <SelectItem value='90'>90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant='destructive'
            disabled={!reason.trim() || pending}
            onClick={() =>
              onSubmit({
                reason: reason.trim(),
                ...(duration === 'permanent'
                  ? {}
                  : { expiresInDays: Number(duration) }),
              })
            }
          >
            {pending ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Suspending
              </>
            ) : (
              'Suspend account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ResetPasswordDialog({
  target,
  onOpenChange,
  pending,
  onSubmit,
}: {
  target: StaffTarget | null
  onOpenChange: (open: boolean) => void
  pending: boolean
  onSubmit: (newPassword: string) => void
}) {
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (target) setPassword('')
  }, [target])

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password for {target?.name}</DialogTitle>
          <DialogDescription>
            Sets a new password immediately. Existing sessions stay active —
            revoke them separately if this is a security incident.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-2'>
          <Label htmlFor='new-password'>New password</Label>
          <Input
            id='new-password'
            type='text'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p className='text-muted-foreground text-xs'>
            At least 8 characters. Shown in plain text so you can pass it on.
          </p>
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={password.length < 8 || pending}
            onClick={() => onSubmit(password)}
          >
            {pending ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Saving
              </>
            ) : (
              'Set password'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  destructive,
  pending,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  pending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Working
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
