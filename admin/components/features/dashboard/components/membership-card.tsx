'use client'

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

type MembershipMix = {
  planId: string
  name: string
  count: number
  mrrCents: number
}

type MembershipCardProps = {
  activeMembers: number
  mrrCents: number
  mix: MembershipMix[]
}

// Darkest tint for the top tier, so the visual weight tracks plan value.
const TIER_TINTS = [22, 55, 100]

export function MembershipCard({
  activeMembers,
  mrrCents,
  mix,
}: MembershipCardProps) {
  return (
    <Card className='ring-foreground/10 animate-in fade-in slide-in-from-bottom-2 shadow-none ring-1 duration-500 ease-out fill-mode-backwards'>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>
          {formatMoney(mrrCents)} monthly recurring from{' '}
          {formatNumber(activeMembers)} active member
          {activeMembers === 1 ? '' : 's'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {activeMembers === 0 ? (
          <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
            No active memberships yet.
          </div>
        ) : (
          <>
            <div className='bg-muted flex h-3 overflow-hidden rounded-full'>
              {mix.map((plan, index) => {
                const share = (plan.count / activeMembers) * 100
                if (share === 0) return null
                return (
                  <div
                    key={plan.planId}
                    className='h-full transition-[width] duration-700 ease-out'
                    style={{
                      width: `${share}%`,
                      background: `color-mix(in oklab, var(--primary) ${TIER_TINTS[index] ?? 100}%, transparent)`,
                    }}
                  />
                )
              })}
            </div>

            <div className='space-y-2'>
              {mix.map((plan, index) => (
                <div
                  key={plan.planId}
                  className='flex items-center justify-between text-sm'
                >
                  <span className='flex items-center gap-2'>
                    <span
                      className='size-2.5 rounded-full'
                      style={{
                        background: `color-mix(in oklab, var(--primary) ${TIER_TINTS[index] ?? 100}%, transparent)`,
                      }}
                    />
                    <span className='text-muted-foreground'>{plan.name}</span>
                  </span>
                  <span className='tabular-nums'>
                    <span className='font-medium'>
                      {formatNumber(plan.count)}
                    </span>
                    <span className='text-muted-foreground ml-2'>
                      {formatMoney(plan.mrrCents)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
