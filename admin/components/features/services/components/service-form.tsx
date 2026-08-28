'use client'

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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useTRPC } from '@/lib/trpc/client'
import type { ServiceFormValues } from '../schemas/service.schema'

type ServiceFormProps = {
  values: ServiceFormValues
  onChange: (values: ServiceFormValues) => void
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: () => Promise<void>
  onCancel: () => void
}

export function ServiceForm({
  values,
  onChange,
  submitLabel,
  isSubmitting,
  onSubmit,
  onCancel,
}: ServiceFormProps) {
  const trpc = useTRPC()
  const { data: categoriesData } = useQuery(
    trpc.serviceCategories.list.queryOptions(),
  )
  const { data: locationsData } = useQuery(
    trpc.locations.list.queryOptions({ page: 1, limit: 100 }),
  )
  const { data: employeesData } = useQuery(
    trpc.employees.list.queryOptions({ page: 1, limit: 100, status: 'ACTIVE' }),
  )

  const categories = categoriesData as
    | Array<{ id: string; name: string }>
    | undefined
  const locations = locationsData as
    | { items: Array<{ id: string; name: string }> }
    | undefined
  const employees = employeesData as
    | { items: Array<{ id: string; firstName: string; lastName: string }> }
    | undefined

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>Name</Label>
        <Input
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>
      <div className='space-y-2'>
        <Label>Category</Label>
        <Select
          items={categories?.map((c) => ({ value: c.id, label: c.name }))}
          value={values.categoryId}
          onValueChange={(v) => onChange({ ...values, categoryId: v ?? '' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='space-y-2'>
        <Label>Short Description</Label>
        <Input
          value={values.shortDescription}
          onChange={(e) =>
            onChange({ ...values, shortDescription: e.target.value })
          }
        />
      </div>
      <div className='space-y-2'>
        <Label>Detailed Description</Label>
        <Textarea
          value={values.detailedDescription}
          onChange={(e) =>
            onChange({ ...values, detailedDescription: e.target.value })
          }
        />
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <div className='space-y-2'>
          <Label>Duration (min)</Label>
          <Input
            type='number'
            value={values.durationMinutes}
            onChange={(e) =>
              onChange({ ...values, durationMinutes: Number(e.target.value) })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Standard Price ($)</Label>
          <Input
            type='number'
            value={values.standardPrice || ''}
            onChange={(e) =>
              onChange({ ...values, standardPrice: Number(e.target.value) })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Member Price ($)</Label>
          <Input
            type='number'
            value={values.memberPrice ?? ''}
            onChange={(e) =>
              onChange({
                ...values,
                memberPrice: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Status</Label>
          <Select
            value={values.status}
            onValueChange={(v) =>
              onChange({ ...values, status: v as ServiceFormValues['status'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='DRAFT'>Draft</SelectItem>
              <SelectItem value='ARCHIVED'>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex items-center gap-2'>
        <Switch
          checked={values.requiresConsultation}
          onCheckedChange={(v) =>
            onChange({ ...values, requiresConsultation: v })
          }
        />
        <Label>Requires consultation first</Label>
      </div>
      <div className='flex items-center gap-2'>
        <Switch
          checked={values.depositRequired}
          onCheckedChange={(v) => onChange({ ...values, depositRequired: v })}
        />
        <Label>Deposit required</Label>
      </div>
      {values.depositRequired && (
        <div className='space-y-2'>
          <Label>Deposit Amount ($)</Label>
          <Input
            type='number'
            value={values.depositAmount ?? ''}
            onChange={(e) =>
              onChange({ ...values, depositAmount: Number(e.target.value) })
            }
          />
        </div>
      )}
      <div className='space-y-2'>
        <Label>Staff</Label>
        <div className='max-h-32 space-y-1 overflow-y-auto rounded border p-2'>
          {employees?.items.map((emp) => (
            <label key={emp.id} className='flex items-center gap-2 text-sm'>
              <input
                type='checkbox'
                checked={values.staffEmployeeIds.includes(emp.id)}
                onChange={(e) => {
                  onChange({
                    ...values,
                    staffEmployeeIds: e.target.checked
                      ? [...values.staffEmployeeIds, emp.id]
                      : values.staffEmployeeIds.filter((id) => id !== emp.id),
                  })
                }}
              />
              {emp.firstName} {emp.lastName}
            </label>
          ))}
        </div>
      </div>
      <div className='space-y-2'>
        <Label>Location Overrides</Label>
        {locations?.items.map((loc) => {
          const existing = values.locations.find(
            (l) => l.locationId === loc.id,
          )
          return (
            <div key={loc.id} className='rounded border p-2 text-sm'>
              <label className='flex items-center gap-2 font-medium'>
                <input
                  type='checkbox'
                  checked={!!existing}
                  onChange={(e) => {
                    onChange({
                      ...values,
                      locations: e.target.checked
                        ? [
                            ...values.locations,
                            { locationId: loc.id, isAvailable: true },
                          ]
                        : values.locations.filter(
                            (l) => l.locationId !== loc.id,
                          ),
                    })
                  }}
                />
                {loc.name}
              </label>
              {existing && (
                <div className='mt-2 grid grid-cols-2 gap-2'>
                  <Input
                    placeholder='Price override ($)'
                    type='number'
                    value={existing.priceOverride ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        locations: values.locations.map((l) =>
                          l.locationId === loc.id
                            ? {
                                ...l,
                                priceOverride:
                                  Number(e.target.value) || undefined,
                              }
                            : l,
                        ),
                      })
                    }
                  />
                  <Input
                    placeholder='Room/Equipment'
                    value={existing.roomOrEquipment ?? ''}
                    onChange={(e) =>
                      onChange({
                        ...values,
                        locations: values.locations.map((l) =>
                          l.locationId === loc.id
                            ? { ...l, roomOrEquipment: e.target.value }
                            : l,
                        ),
                      })
                    }
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className='flex gap-3'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={isSubmitting} onClick={() => void onSubmit()}>
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
