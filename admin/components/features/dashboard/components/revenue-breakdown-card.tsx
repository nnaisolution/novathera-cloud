'use client'

import { Label, Pie, PieChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import {
  formatMoney,
  formatMoneyCompact,
} from '@/components/features/dashboard/utils/format'

const chartConfig = {
  amount: { label: 'Revenue' },
  services: {
    label: 'Services',
    color: 'var(--primary)',
  },
  shop: {
    label: 'Shop',
    color: 'color-mix(in oklab, var(--primary) 55%, transparent)',
  },
  membership: {
    label: 'Membership MRR',
    color: 'color-mix(in oklab, var(--primary) 22%, transparent)',
  },
} satisfies ChartConfig

type RevenueBreakdownCardProps = {
  servicesCents: number
  shopCents: number
  mrrCents: number
}

export function RevenueBreakdownCard({
  servicesCents,
  shopCents,
  mrrCents,
}: RevenueBreakdownCardProps) {
  const data = [
    { line: 'services', amount: servicesCents, fill: 'var(--color-services)' },
    { line: 'shop', amount: shopCents, fill: 'var(--color-shop)' },
    { line: 'membership', amount: mrrCents, fill: 'var(--color-membership)' },
  ].filter((slice) => slice.amount > 0)

  const total = servicesCents + shopCents + mrrCents

  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Revenue by line</CardTitle>
        <CardDescription>
          Membership is current monthly recurring, not period revenue
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {total > 0 ? (
          <>
            <ChartContainer config={chartConfig} className='mx-auto h-52 w-full'>
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
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
                <Pie
                  data={data}
                  dataKey='amount'
                  nameKey='line'
                  innerRadius={62}
                  outerRadius={84}
                  paddingAngle={2}
                  animationDuration={700}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !('cx' in viewBox)) return null
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor='middle'
                          dominantBaseline='middle'
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) - 8}
                            className='fill-card-foreground text-xl font-semibold'
                          >
                            {formatMoneyCompact(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 16}
                            className='fill-muted-foreground text-xs'
                          >
                            combined
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className='space-y-2'>
              {data.map((slice) => {
                const config = chartConfig[slice.line as keyof typeof chartConfig]
                return (
                  <div
                    key={slice.line}
                    className='flex items-center justify-between text-sm'
                  >
                    <span className='flex items-center gap-2'>
                      <span
                        className='size-2.5 rounded-full'
                        style={{ background: slice.fill }}
                      />
                      <span className='text-muted-foreground'>
                        {config?.label}
                      </span>
                    </span>
                    <span className='font-medium tabular-nums'>
                      {formatMoney(slice.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div className='text-muted-foreground flex h-52 items-center justify-center text-sm'>
            No revenue in this period.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
