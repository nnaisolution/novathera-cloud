'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  defaultLocationFormValues,
  locationFormSchema,
  type LocationFormValues,
} from '../schemas/location.schema'
import { OperatingHoursEditor } from './operating-hours-editor'

type LocationFormProps = {
  defaultValues?: LocationFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: LocationFormValues) => Promise<void>
  onCancel: () => void
}

export function LocationForm({
  defaultValues = defaultLocationFormValues,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: LocationFormProps) {
  const form = useForm<LocationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(locationFormSchema) as any,
    defaultValues,
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='name'>Location Name</Label>
          <Input id='name' {...form.register('name')} />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='addressLine1'>Address Line 1</Label>
          <Input id='addressLine1' {...form.register('addressLine1')} />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='addressLine2'>Address Line 2</Label>
          <Input id='addressLine2' {...form.register('addressLine2')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='city'>City</Label>
          <Input id='city' {...form.register('city')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='province'>Province</Label>
          <Input id='province' {...form.register('province')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='postalCode'>Postal Code</Label>
          <Input id='postalCode' {...form.register('postalCode')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Phone</Label>
          <Input id='phone' {...form.register('phone')} />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' {...form.register('email')} />
        </div>
        <div className='space-y-2 sm:col-span-2'>
          <Label htmlFor='googleMapsUrl'>Google Maps URL</Label>
          <Input id='googleMapsUrl' {...form.register('googleMapsUrl')} />
        </div>
        <div className='space-y-2'>
          <Label>Status</Label>
          <Select
            value={form.watch('status')}
            onValueChange={(value) =>
              form.setValue('status', value as LocationFormValues['status'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='OPEN'>Open</SelectItem>
              <SelectItem value='COMING_SOON'>Coming Soon</SelectItem>
              <SelectItem value='CLOSED'>Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <OperatingHoursEditor control={form.control} />
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
