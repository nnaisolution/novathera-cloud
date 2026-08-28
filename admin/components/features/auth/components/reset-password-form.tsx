'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useResetPassword } from '../hooks/use-reset-password'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/reset-password.schema'

export function ResetPasswordForm() {
  const { resetPassword, isPending, error, hasToken } = useResetPassword()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  if (!hasToken) {
    return (
      <div className='space-y-4'>
        <Alert variant='destructive'>
          <AlertDescription>
            This reset link is invalid or has expired. Request a new one to continue.
          </AlertDescription>
        </Alert>
        <Link
          href='/forgot-password'
          className='border-border bg-background hover:bg-muted inline-flex h-8 w-full items-center justify-center rounded-lg border text-sm font-medium'
        >
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(resetPassword)} className='space-y-4'>
      {error ? (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className='gap-4'>
        <Field className='w-full gap-2' data-invalid={!!errors.password}>
          <FieldLabel htmlFor='password'>New password*</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='••••••••••••••••'
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isPasswordVisible ? <IconEyeOff /> : <IconEye />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.password]} />
        </Field>

        <Field className='w-full gap-2' data-invalid={!!errors.confirmPassword}>
          <FieldLabel htmlFor='confirmPassword'>Confirm password*</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='confirmPassword'
              type={isConfirmPasswordVisible ? 'text' : 'password'}
              autoComplete='new-password'
              placeholder='••••••••••••••••'
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <InputGroupAddon align='inline-end' className='pr-1.5'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => setIsConfirmPasswordVisible((prev) => !prev)}
                className='text-muted-foreground rounded-l-none hover:bg-transparent'
              >
                {isConfirmPasswordVisible ? <IconEyeOff /> : <IconEye />}
              </Button>
            </InputGroupAddon>
          </InputGroup>
          <FieldError errors={[errors.confirmPassword]} />
        </Field>

        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Updating...' : 'Reset password'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
