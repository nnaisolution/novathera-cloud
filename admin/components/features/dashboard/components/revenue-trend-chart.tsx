'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  formatDayLabel,
  formatMoney,
  formatMoneyCompact,
} from '@/components/features/dashboard/utils/format'

const chartConfig = {
  servicesCents: {
    label: 'Services',
    color: 'var(--primary)',
  },
  shopCents: {
    label: 'Shop',
    color: 'color-mix(in oklab, var(--primary) 45%, transparent)',
  },
} satisfies ChartConfig

type RevenueTrendChartProps = {
  data: { date: string; servicesCents: number; shopCents: number }[]
  totalCents: number
}

export function RevenueTrendChart({ data, totalCents }: RevenueTrendChartProps) {
  const hasData = data.some(
    (point) => point.servicesCents > 0 || point.shopCents > 0,
  )

  // Thin the axis labels so long ranges stay legible.
  const tickInterval = Math.max(0, Math.floor(data.length / 8) - 1)

  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Revenue over time</CardTitle>
        <CardDescription>
          {hasData
            ? `${formatMoney(totalCents)} across appointments and shop orders`
            : 'Appointments and shop orders'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ChartContainer config={chartConfig} className='h-72 w-full'>
            <AreaChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
              <defs>
                <linearGradient id='fillServices' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-servicesCents)'
                    stopOpacity={0.7}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-servicesCents)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id='fillShop' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--color-shopCents)'
                    stopOpacity={0.7}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--color-shopCents)'
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={tickInterval}
                tickFormatter={formatDayLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={64}
                tickFormatter={(value: number) => formatMoneyCompact(value)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) =>
                      typeof label === 'string' ? formatDayLabel(label) : label
                    }
                    formatter={(value, name) => (
                      <div className='flex w-full items-center justify-between gap-4'>
                        <span className='text-muted-foreground'>
                          {chartConfig[name as keyof typeof chartConfig]
                            ?.label ?? name}
                        </span>
                        <span className='font-medium tabular-nums'>
                          {formatMoney(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />

              <Area
                dataKey='servicesCents'
                type='monotone'
                stackId='revenue'
                stroke='var(--color-servicesCents)'
                fill='url(#fillServices)'
                strokeWidth={2}
                animationDuration={700}
              />
              <Area
                dataKey='shopCents'
                type='monotone'
                stackId='revenue'
                stroke='var(--color-shopCents)'
                fill='url(#fillShop)'
                strokeWidth={2}
                animationDuration={700}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className='text-muted-foreground flex h-72 items-center justify-center text-sm'>
            No revenue recorded in this period.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
