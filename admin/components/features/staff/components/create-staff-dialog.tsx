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
import { ASSIGNABLE_ROLES, ROLE_LABELS } from '@/components/features/staff/utils/roles'
import type { AssignableRole } from '@/components/features/staff/utils/roles'

type CreateStaffDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pending: boolean
  onSubmit: (input: {
    email: string
    name: string
    password: string
    role: AssignableRole
  }) => void
}

const EMPTY = { email: '', name: '', password: '', role: 'staff' as AssignableRole }

export function CreateStaffDialog({
  open,
  onOpenChange,
  pending,
  onSubmit,
}: CreateStaffDialogProps) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (open) setForm(EMPTY)
  }, [open])

  const valid =
    form.email.includes('@') && form.name.trim() && form.password.length >= 8

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New staff account</DialogTitle>
          <DialogDescription>
            Creates the account immediately. Share the temporary password with
            them and ask them to change it after signing in.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='staff-name'>Full name</Label>
            <Input
              id='staff-name'
              value={form.name}
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='staff-email'>Email</Label>
            <Input
              id='staff-email'
              type='email'
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='staff-password'>Temporary password</Label>
            <Input
              id='staff-password'
              type='text'
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
            />
            <p className='text-muted-foreground text-xs'>
              At least 8 characters.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='staff-role'>Role</Label>
            <Select
              value={form.role}
              onValueChange={(role) =>
                setForm({ ...form, role: role as AssignableRole })
              }
            >
              <SelectTrigger id='staff-role' className='w-full'>
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
          </div>
        </div>

        <DialogFooter>
          <Button variant='ghost' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!valid || pending} onClick={() => onSubmit(form)}>
            {pending ? (
              <>
                <IconLoader2 className='size-4 animate-spin' />
                Creating
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
