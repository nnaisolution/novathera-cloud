'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { useLogin } from '../hooks/use-login'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'

export function LoginForm() {
  const { login, isPending, error } = useLogin()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form

  const rememberMe = watch('rememberMe')

  return (
    <form onSubmit={handleSubmit(login)} className='space-y-4'>
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

        <Field className='w-full gap-2' data-invalid={!!errors.password}>
          <FieldLabel htmlFor='password'>Password*</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id='password'
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete='current-password'
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

        <Field orientation='horizontal' className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Checkbox
              id='rememberMe'
              checked={rememberMe}
              onCheckedChange={(checked) =>
                setValue('rememberMe', checked === true, { shouldValidate: true })
              }
            />
            <FieldLabel htmlFor='rememberMe'>Remember me</FieldLabel>
          </div>
          <Link
            href='/forgot-password'
            className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-2'
          >
            Forgot password?
          </Link>
        </Field>

        <Field>
          <Button className='w-full' type='submit' disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
