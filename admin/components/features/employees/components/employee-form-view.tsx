'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/lib/trpc/client'
import { useEmployeeMutations } from '../hooks/use-employee-mutations'
import {
  defaultEmployeeFormValues,
  mapEmployeeToForm,
} from '../utils/map-employee-to-form'
import { EmployeeForm } from './employee-form'

const TEMP_PASSWORD_KEY = 'employeeTempPassword'

export function EmployeeFormView({ employeeId }: { employeeId?: string }) {
  const router = useRouter()
  const trpc = useTRPC()
  const isEdit = Boolean(employeeId)

  const { data, isLoading } = useQuery({
    ...trpc.employees.getById.queryOptions({ id: employeeId! }),
    enabled: isEdit,
  })

  const { createEmployee, updateEmployee, isCreating, isUpdating } =
    useEmployeeMutations()

  if (isEdit && isLoading) {
    return <Skeleton className='h-96 w-full' />
  }

  const defaultValues =
    isEdit && data
      ? mapEmployeeToForm(data as Record<string, unknown>)
      : defaultEmployeeFormValues

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/employees'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <IconArrowLeft className='size-4' />
        </Link>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {isEdit
              ? 'Update staff profile, role, and certifications.'
              : 'Create a new staff member and login account.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Employee details</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm
            key={employeeId ?? 'new'}
            defaultValues={defaultValues}
            submitLabel={isEdit ? 'Save Changes' : 'Create Employee'}
            isSubmitting={isCreating || isUpdating}
            onCancel={() => router.push('/employees')}
            onSubmit={async (values) => {
              if (isEdit && employeeId) {
                await updateEmployee(employeeId, values)
                router.push('/employees')
              } else {
                const result = (await createEmployee(values)) as {
                  tempPassword?: string
                }
                if (result?.tempPassword) {
                  sessionStorage.setItem(TEMP_PASSWORD_KEY, result.tempPassword)
                }
                router.push('/employees')
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export { TEMP_PASSWORD_KEY }
