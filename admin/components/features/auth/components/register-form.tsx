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
import { useRegister } from '../hooks/use-register'
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/register.schema'

export function RegisterForm() {
  const { registerAdmin, isPending, error } = useRegister()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(registerAdmin)} className='space-y-4'>
      {error ? (
        <Alert variant='destructive'>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className='gap-4'>
        <Field className='w-full gap-2' data-invalid={!!errors.name}>
          <FieldLabel htmlFor='name'>Full name*</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='name'
              type='text'
              autoComplete='name'
              placeholder='Jordan Blake'
              aria-invalid={!!errors.name}
              {...register('name')}
            />
          </InputGroup>
          <FieldError errors={[errors.name]} />
        </Field>

        <Field className='w-full gap-2' data-invalid={!!errors.email}>
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

        <Field className='w-full gap-2' data-invalid={!!errors.password}>
          <FieldLabel htmlFor='password'>Password*</FieldLabel>
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
          <p className='text-muted-foreground text-xs'>
            At least 12 characters, with upper and lower case, a number and a
            symbol.
          </p>
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
            {isPending ? 'Creating account...' : 'Create admin account'}
          </Button>
        </Field>
      </FieldGroup>

      <p className='text-muted-foreground text-center text-sm'>
        Already have an account?{' '}
        <Link href='/login' className='text-foreground font-medium underline'>
          Sign in
        </Link>
      </p>
    </form>
  )
}
