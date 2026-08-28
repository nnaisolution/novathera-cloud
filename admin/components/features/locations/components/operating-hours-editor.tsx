'use client'

import type { Control } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import type { LocationFormValues } from '../schemas/location.schema'

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

export function OperatingHoursEditor({
  control,
}: {
  control: Control<LocationFormValues>
}) {
  const hours = useWatch({ control, name: 'operatingHours' })

  return (
    <div className='space-y-3'>
      <Label>Operating Hours</Label>
      {DAYS.map((day, index) => (
        <div key={day} className='grid grid-cols-[120px_80px_1fr_1fr] items-center gap-3'>
          <span className='text-sm font-medium'>{DAY_LABELS[day]}</span>
          <Controller
            control={control}
            name={`operatingHours.${index}.isOpen`}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name={`operatingHours.${index}.openTime`}
            render={({ field }) => (
              <Input type='time' {...field} disabled={!hours?.[index]?.isOpen} />
            )}
          />
          <Controller
            control={control}
            name={`operatingHours.${index}.closeTime`}
            render={({ field }) => (
              <Input type='time' {...field} disabled={!hours?.[index]?.isOpen} />
            )}
          />
        </div>
      ))}
    </div>
  )
}
