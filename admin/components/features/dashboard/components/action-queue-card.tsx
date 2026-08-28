'use client'

import {
  IconAlertTriangle,
  IconCertificate,
  IconChevronRight,
  IconClipboardCheck,
  IconPackage,
  type TablerIcon,
} from '@tabler/icons-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  daysUntil,
  formatDate,
  formatNumber,
} from '@/components/features/dashboard/utils/format'

type LowStock = {
  productId: string
  name: string
  quantity: number
  lowStockThreshold: number
}

type ExpiringCertification = {
  id: string
  name: string
  expiresAt: Date
  expired: boolean
  employeeId: string
  employeeName: string
}

type ActionQueueCardProps = {
  unresolvedBookings: number
  /** null means the viewer lacks permission for that section. */
  ordersAwaitingFulfillment: number | null
  lowStock: LowStock[] | null
  expiringCertifications: ExpiringCertification[] | null
}

function QueueRow({
  icon: Icon,
  href,
  title,
  detail,
  count,
  urgent,
}: {
  icon: TablerIcon
  href: string
  title: string
  detail: string
  count?: number
  urgent?: boolean
}) {
  return (
    <Link
      href={href}
      className='hover:bg-muted/60 -mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors'
    >
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-sm',
          urgent
            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
            : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className='size-4' />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>{title}</p>
        <p className='text-muted-foreground truncate text-xs'>{detail}</p>
      </div>

      {count !== undefined ? (
        <Badge variant={urgent ? 'destructive' : 'secondary'}>
          {formatNumber(count)}
        </Badge>
      ) : null}
      <IconChevronRight className='text-muted-foreground size-4 shrink-0' />
    </Link>
  )
}

export function ActionQueueCard({
  unresolvedBookings,
  ordersAwaitingFulfillment,
  lowStock,
  expiringCertifications,
}: ActionQueueCardProps) {
  const rows: React.ReactNode[] = []

  if (unresolvedBookings > 0) {
    rows.push(
      <QueueRow
        key='bookings'
        icon={IconClipboardCheck}
        href='/bookings'
        title='Appointments awaiting close-out'
        detail='Past their end time but still marked confirmed'
        count={unresolvedBookings}
        urgent
      />,
    )
  }

  if (ordersAwaitingFulfillment !== null && ordersAwaitingFulfillment > 0) {
    rows.push(
      <QueueRow
        key='orders'
        icon={IconPackage}
        href='/orders'
        title='Paid orders to fulfil'
        detail='Customers have paid and are waiting to ship'
        count={ordersAwaitingFulfillment}
      />,
    )
  }

  if (lowStock && lowStock.length > 0) {
    const worst = lowStock[0]
    rows.push(
      <QueueRow
        key='stock'
        icon={IconAlertTriangle}
        href='/products'
        title='Products low on stock'
        detail={`${worst.name} is down to ${formatNumber(worst.quantity)}`}
        count={lowStock.length}
        urgent={worst.quantity === 0}
      />,
    )
  }

  if (expiringCertifications && expiringCertifications.length > 0) {
    const soonest = expiringCertifications[0]
    const days = daysUntil(soonest.expiresAt)
    rows.push(
      <QueueRow
        key='certs'
        icon={IconCertificate}
        href='/employees'
        title='Certifications expiring'
        detail={
          soonest.expired
            ? `${soonest.employeeName} — ${soonest.name} expired ${formatDate(soonest.expiresAt)}`
            : `${soonest.employeeName} — ${soonest.name} in ${days} day${days === 1 ? '' : 's'}`
        }
        count={expiringCertifications.length}
        urgent={soonest.expired}
      />,
    )
  }

  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
        <CardDescription>
          {rows.length === 0
            ? 'Nothing outstanding'
            : `${rows.length} thing${rows.length === 1 ? '' : 's'} to look at`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
            All clear — nothing needs your attention right now.
          </div>
        ) : (
          <div className='divide-border divide-y'>{rows}</div>
        )}
      </CardContent>
    </Card>
  )
}
