'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTRPC } from '@/lib/trpc/client'
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from '../schemas/employee.schema'

type EmployeeFormProps = {
  defaultValues: EmployeeFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: EmployeeFormValues) => Promise<void>
  onCancel: () => void
}

export function EmployeeForm({
  defaultValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  const trpc = useTRPC()
  const { data: locationsData } = useQuery(
    trpc.locations.list.queryOptions({ page: 1, limit: 100 }),
  )
  const locations = locationsData as
    | { items: { id: string; name: string }[] }
    | undefined

  const form = useForm<EmployeeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(employeeFormSchema) as any,
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'certifications',
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <Tabs defaultValue='personal'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='personal'>Personal Info</TabsTrigger>
          <TabsTrigger value='role'>Role & Access</TabsTrigger>
          <TabsTrigger value='certs'>Certs & Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value='personal' className='mt-4 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>First Name</Label>
              <Input {...form.register('firstName')} />
            </div>
            <div className='space-y-2'>
              <Label>Last Name</Label>
              <Input {...form.register('lastName')} />
            </div>
            <div className='space-y-2 sm:col-span-2'>
              <Label>Photo URL</Label>
              <Input {...form.register('photoUrl')} />
            </div>
            <div className='space-y-2'>
              <Label>Date of Birth</Label>
              <Input type='date' {...form.register('dateOfBirth')} />
            </div>
            <div className='space-y-2'>
              <Label>Gender</Label>
              <Select
                value={form.watch('gender') ?? ''}
                onValueChange={(v) =>
                  form.setValue('gender', v as EmployeeFormValues['gender'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MALE'>Male</SelectItem>
                  <SelectItem value='FEMALE'>Female</SelectItem>
                  <SelectItem value='OTHER'>Other</SelectItem>
                  <SelectItem value='PREFER_NOT_TO_SAY'>
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Personal Phone</Label>
              <Input {...form.register('personalPhone')} />
            </div>
            <div className='space-y-2'>
              <Label>Personal Email</Label>
              <Input type='email' {...form.register('personalEmail')} />
            </div>
            <div className='space-y-2'>
              <Label>Emergency Contact Name</Label>
              <Input {...form.register('emergencyContactName')} />
            </div>
            <div className='space-y-2'>
              <Label>Emergency Contact Phone</Label>
              <Input {...form.register('emergencyContactPhone')} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value='role' className='mt-4 space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Job Title</Label>
              <Input {...form.register('jobTitle')} />
            </div>
            <div className='space-y-2'>
              <Label>Department</Label>
              <Input {...form.register('department')} />
            </div>
            <div className='space-y-2'>
              <Label>Employment Type</Label>
              <Select
                value={form.watch('employmentType')}
                onValueChange={(v) =>
                  form.setValue(
                    'employmentType',
                    v as EmployeeFormValues['employmentType'],
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='FULL_TIME'>Full-time</SelectItem>
                  <SelectItem value='PART_TIME'>Part-time</SelectItem>
                  <SelectItem value='CONTRACT'>Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Start Date</Label>
              <Input type='date' {...form.register('startDate')} />
            </div>
            <div className='space-y-2'>
              <Label>Location</Label>
              <Select
                items={locations?.items.map((loc) => ({
                  value: loc.id,
                  label: loc.name,
                }))}
                value={form.watch('locationId') ?? ''}
                onValueChange={(v) => form.setValue('locationId', v ?? undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select location' />
                </SelectTrigger>
                <SelectContent>
                  {locations?.items.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Work Email (login)</Label>
              <Input type='email' {...form.register('workEmail')} />
            </div>
            <div className='space-y-2'>
              <Label>Role</Label>
              <Select
                value={form.watch('role')}
                onValueChange={(v) =>
                  form.setValue('role', v as EmployeeFormValues['role'])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='manager'>Manager</SelectItem>
                  <SelectItem value='staff'>Staff</SelectItem>
                  <SelectItem value='receptionist'>Receptionist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='certs' className='mt-4 space-y-4'>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Certifications</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  append({
                    name: '',
                    qualification: '',
                    licenseNumber: '',
                    expiresAt: '',
                  })
                }
              >
                Add
              </Button>
            </div>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className='grid gap-2 rounded-lg border p-3 sm:grid-cols-2'
              >
                <Input
                  placeholder='Certification name'
                  {...form.register(`certifications.${index}.name`)}
                />
                <Input
                  placeholder='Qualification'
                  {...form.register(`certifications.${index}.qualification`)}
                />
                <Input
                  placeholder='License number'
                  {...form.register(`certifications.${index}.licenseNumber`)}
                />
                <div className='flex gap-2'>
                  <Input
                    type='date'
                    {...form.register(`certifications.${index}.expiresAt`)}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Buffer (minutes)</Label>
              <Input type='number' {...form.register('bufferMinutes')} />
            </div>
            <div className='space-y-2'>
              <Label>Max Daily Appointments</Label>
              <Input type='number' {...form.register('maxDailyAppointments')} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className='flex gap-3'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
