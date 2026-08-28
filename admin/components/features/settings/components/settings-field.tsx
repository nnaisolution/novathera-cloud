'use client'

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
import { cn } from '@/lib/utils'
import type { FieldDef } from '@/components/features/settings/types'

type SettingsFieldProps = {
  field: FieldDef
  value: unknown
  error?: string
  disabled?: boolean
  onChange: (value: unknown) => void
}

export function SettingsField({
  field,
  value,
  error,
  disabled,
  onChange,
}: SettingsFieldProps) {
  const id = `setting-${field.name}`

  if (field.type === 'switch') {
    return (
      <div className='flex items-start justify-between gap-4 py-1'>
        <div className='space-y-0.5'>
          <Label htmlFor={id}>{field.label}</Label>
          {field.hint ? (
            <p className='text-muted-foreground text-xs'>{field.hint}</p>
          ) : null}
        </div>
        <Switch
          id={id}
          checked={Boolean(value)}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{field.label}</Label>

      {field.type === 'select' ? (
        <Select
          value={String(value ?? '')}
          disabled={disabled}
          onValueChange={onChange}
        >
          <SelectTrigger id={id} className='w-full'>
            <SelectValue placeholder='Select…' />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === 'money' ? (
        <div className='relative'>
          <span className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm'>
            $
          </span>
          <Input
            id={id}
            type='number'
            min={0}
            step={0.01}
            className={cn('pl-7', error && 'border-destructive')}
            disabled={disabled}
            // Stored in cents; shown in dollars.
            value={
              typeof value === 'number' ? (value / 100).toFixed(2) : ''
            }
            onChange={(event) => {
              const dollars = Number(event.target.value)
              onChange(
                Number.isFinite(dollars) ? Math.round(dollars * 100) : 0,
              )
            }}
          />
        </div>
      ) : field.type === 'emails' ? (
        <Input
          id={id}
          className={cn(error && 'border-destructive')}
          disabled={disabled}
          placeholder='ops@novathera.ca, owner@novathera.ca'
          value={Array.isArray(value) ? value.join(', ') : ''}
          onChange={(event) =>
            onChange(
              event.target.value
                .split(',')
                .map((entry) => entry.trim())
                .filter(Boolean),
            )
          }
        />
      ) : field.type === 'number' ? (
        <div className='relative'>
          <Input
            id={id}
            type='number'
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            className={cn(field.suffix && 'pr-20', error && 'border-destructive')}
            disabled={disabled}
            value={typeof value === 'number' ? value : ''}
            onChange={(event) => {
              const next = Number(event.target.value)
              onChange(Number.isFinite(next) ? next : 0)
            }}
          />
          {field.suffix ? (
            <span className='text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs'>
              {field.suffix}
            </span>
          ) : null}
        </div>
      ) : (
        <Input
          id={id}
          type={field.type === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder}
          className={cn(error && 'border-destructive')}
          disabled={disabled}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error ? (
        <p className='text-destructive text-xs'>{error}</p>
      ) : field.hint ? (
        <p className='text-muted-foreground text-xs'>{field.hint}</p>
      ) : null}
    </div>
  )
}
