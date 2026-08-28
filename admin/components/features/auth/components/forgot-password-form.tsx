'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useForgotPassword } from '../hooks/use-forgot-password'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema'

export function ForgotPasswordForm() {
  const { requestReset, isPending, error, isSuccess } = useForgotPassword()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  if (isSuccess) {
    return (
      <div className='space-y-4'>
        <Alert>
          <AlertDescription>
            If an account exists for that email, we sent a password reset link.
            Check your inbox and spam folder.
          </AlertDescription>
        </Alert>
        <Link
          href='/login'
          className='border-border bg-background hover:bg-muted inline-flex h-8 w-full items-center justify-center rounded-lg border text-sm font-medium'
        >
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(requestReset)} className='space-y-4'>
      {error ? (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className='gap-4'>
        <Field className='gap-2' data-invalid={!!errors.email}>
          <FieldLabel htmlFor='email'>Email address*</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='email'
              type='email'
              autoComplete='email'
              placeholder='you@example.com'
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </InputGroup>
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Sending...' : 'Send reset link'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
