'use client'

import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconMinus,
  type TablerIcon,
} from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  describeChange,
  type ChangeTone,
} from '@/components/features/dashboard/utils/format'

const TONE_STYLES: Record<ChangeTone, string> = {
  up: 'text-emerald-600 dark:text-emerald-400',
  down: 'text-rose-600 dark:text-rose-400',
  flat: 'text-muted-foreground',
  unknown: 'text-muted-foreground',
}

const TONE_ICONS: Record<ChangeTone, TablerIcon | null> = {
  up: IconArrowUpRight,
  down: IconArrowDownRight,
  flat: IconMinus,
  unknown: null,
}

type KpiCardProps = {
  icon: TablerIcon
  label: string
  value: string
  changePct?: number | null
  /** Set when a rising number is bad news, e.g. no-show rate. */
  invertChange?: boolean
  comparisonLabel?: string
  /** Staggers the entrance animation across a row of cards. */
  index?: number
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  changePct,
  invertChange,
  comparisonLabel = 'vs previous period',
  index = 0,
}: KpiCardProps) {
  const change =
    changePct === undefined
      ? null
      : describeChange(changePct, { invert: invertChange })
  const ToneIcon = change ? TONE_ICONS[change.tone] : null

  return (
    <Card
      className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards transition-shadow hover:shadow-md'
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground text-sm font-medium'>
            {label}
          </span>
          <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm'>
            <Icon className='size-4' />
          </div>
        </div>

        <span className='text-3xl font-semibold tracking-tight tabular-nums'>
          {value}
        </span>

        {change ? (
          <div className='flex items-center gap-1.5 text-sm'>
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-medium',
                TONE_STYLES[change.tone],
              )}
            >
              {ToneIcon ? <ToneIcon className='size-4' /> : null}
              {change.label}
            </span>
            {change.tone !== 'unknown' ? (
              <span className='text-muted-foreground'>{comparisonLabel}</span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function KpiCardSkeleton() {
  return (
    <Card className='ring-foreground/10 shadow-none ring-1'>
      <CardContent className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='size-8 rounded-sm' />
        </div>
        <Skeleton className='h-9 w-32' />
        <Skeleton className='h-4 w-40' />
      </CardContent>
    </Card>
  )
}
