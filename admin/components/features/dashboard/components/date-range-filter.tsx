'use client'

import { IconCalendar } from '@tabler/icons-react'
import { useState } from 'react'
import type { DateRange as DayPickerRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  DATE_PRESETS,
  PRESET_LABELS,
  type DateRange,
} from '@/components/features/dashboard/types'
import { formatDate } from '@/components/features/dashboard/utils/format'

const QUICK_PRESETS = DATE_PRESETS.filter((preset) => preset !== 'custom')

type DateRangeFilterProps = {
  value: DateRange
  onChange: (range: DateRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)

  const customLabel =
    value.preset === 'custom' && value.from && value.to
      ? `${formatDate(value.from)} — ${formatDate(value.to)}`
      : PRESET_LABELS.custom

  function handleSelect(selected: DayPickerRange | undefined) {
    onChange({ preset: 'custom', from: selected?.from, to: selected?.to })
    // Close once a complete range exists, so the picker stays open while the
    // user is still choosing the end date.
    if (selected?.from && selected?.to) setOpen(false)
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <div className='bg-muted/60 inline-flex rounded-lg p-1'>
        {QUICK_PRESETS.map((preset) => {
          const active = value.preset === preset
          return (
            <button
              key={preset}
              type='button'
              onClick={() => onChange({ preset })}
              className={cn(
                'relative rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {PRESET_LABELS[preset].replace('Last ', '')}
            </button>
          )
        })}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant={value.preset === 'custom' ? 'default' : 'outline'}
              size='sm'
              className='gap-2'
            />
          }
        >
          <IconCalendar className='size-4' />
          {customLabel}
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='end'>
          <Calendar
            mode='range'
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={handleSelect}
            disabled={(date) => date > new Date()}
            numberOfMonths={2}
            className='rounded-md'
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
