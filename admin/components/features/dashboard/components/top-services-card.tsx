'use client'

import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  formatMoney,
  formatNumber,
} from '@/components/features/dashboard/utils/format'

type TopService = {
  serviceId: string
  name: string
  categoryName: string | null
  revenueCents: number
  bookings: number
}

export function TopServicesCard({ services }: { services: TopService[] }) {
  const max = services[0]?.revenueCents ?? 0

  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Top services</CardTitle>
        <CardDescription>By revenue in the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <div className='text-muted-foreground flex h-40 items-center justify-center text-sm'>
            No paid appointments in this period.
          </div>
        ) : (
          <ol className='space-y-4'>
            {services.map((service, index) => (
              <li key={service.serviceId} className='space-y-1.5'>
                <div className='flex items-baseline justify-between gap-3'>
                  <span className='truncate text-sm font-medium'>
                    <span className='text-muted-foreground mr-2 tabular-nums'>
                      {index + 1}
                    </span>
                    {service.name}
                  </span>
                  <span className='text-sm font-semibold tabular-nums'>
                    {formatMoney(service.revenueCents)}
                  </span>
                </div>

                <div className='bg-muted h-2 overflow-hidden rounded-full'>
                  <div
                    className='bg-primary h-full rounded-full transition-[width] duration-700 ease-out'
                    style={{
                      width: max === 0 ? '0%' : `${(service.revenueCents / max) * 100}%`,
                    }}
                  />
                </div>

                <p className='text-muted-foreground text-xs'>
                  {formatNumber(service.bookings)} booking
                  {service.bookings === 1 ? '' : 's'}
                  {service.categoryName ? ` · ${service.categoryName}` : ''}
                </p>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
      <CardContent className='pt-0'>
        <Link
          href='/services'
          className='text-muted-foreground hover:text-foreground text-sm underline underline-offset-4 transition-colors'
        >
          Manage services
        </Link>
      </CardContent>
    </Card>
  )
}
