'use client'

import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export type BrandSplit = {
  id: string
  grossCents: number
  stripeFeeCents: number
  transferCents: number
  reversedCents: number
  transferStatus: string
  transferError: string | null
  stripeTransferId: string | null
  brand: { id: string; name: string; isPlatform: boolean }
}

const STATUS_LABEL: Record<string, string> = {
  NOT_APPLICABLE: 'Settled directly',
  OWED: 'Owed',
  AWAITING_ONBOARDING: 'Awaiting onboarding',
  PENDING: 'Transfer sent',
  PAID: 'Paid out',
  PARTIALLY_REVERSED: 'Partially reversed',
  REVERSED: 'Reversed',
  FAILED: 'Failed',
}

const NEEDS_ATTENTION = new Set([
  'OWED',
  'AWAITING_ONBOARDING',
  'FAILED',
])

function formatMoney(cents: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function statusBadge(split: BrandSplit) {
  const label = STATUS_LABEL[split.transferStatus] ?? split.transferStatus
  if (split.brand.isPlatform) return <Badge variant='outline'>{label}</Badge>
  if (split.transferStatus === 'FAILED') {
    return <Badge variant='destructive'>{label}</Badge>
  }
  if (NEEDS_ATTENTION.has(split.transferStatus)) {
    return <Badge variant='secondary'>{label}</Badge>
  }
  return <Badge variant='default'>{label}</Badge>
}

type Props = {
  splits: BrandSplit[]
  currency: string
  stripeFeeCents: number
  canRetry: boolean
  isRetrying: boolean
  onRetry: () => void
}

/**
 * Where each business's share of this order went. The platform brand settles
 * into the Stripe account directly; every other brand is paid by transfer.
 */
export function OrderBrandSplits({
  splits,
  currency,
  stripeFeeCents,
  canRetry,
  isRetrying,
  onRetry,
}: Props) {
  if (!splits.length) return null

  const outstanding = splits.filter(
    (split) => !split.brand.isPlatform && NEEDS_ATTENTION.has(split.transferStatus),
  )

  return (
    <Card className='lg:col-span-2'>
      <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2'>
        <CardTitle className='text-base'>Brand payouts</CardTitle>
        {canRetry && outstanding.length > 0 && (
          <Button
            size='sm'
            variant='outline'
            disabled={isRetrying}
            onClick={onRetry}
          >
            <IconRefresh className='size-3.5' />
            Retry payout
          </Button>
        )}
      </CardHeader>
      <CardContent className='space-y-3'>
        {outstanding.length > 0 && (
          <div className='border-destructive/40 bg-destructive/5 flex items-start gap-2 rounded-md border p-3 text-sm'>
            <IconAlertTriangle className='text-destructive mt-0.5 size-4 shrink-0' />
            <div>
              <p className='font-medium'>
                {formatMoney(
                  outstanding.reduce(
                    (sum, split) => sum + split.transferCents,
                    0,
                  ),
                  currency,
                )}{' '}
                still owed
              </p>
              <p className='text-muted-foreground'>
                {outstanding[0].transferError ??
                  'This share has not reached the brand yet.'}
              </p>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead className='text-right'>Customer paid</TableHead>
              <TableHead className='text-right'>Stripe fee</TableHead>
              <TableHead className='text-right'>Transferred</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {splits.map((split) => (
              <TableRow key={split.id}>
                <TableCell>
                  <div className='font-medium'>{split.brand.name}</div>
                  {split.stripeTransferId && (
                    <code className='text-muted-foreground text-xs'>
                      {split.stripeTransferId}
                    </code>
                  )}
                </TableCell>
                <TableCell className='text-right'>
                  {formatMoney(split.grossCents, currency)}
                </TableCell>
                <TableCell className='text-muted-foreground text-right'>
                  {formatMoney(split.stripeFeeCents, currency)}
                </TableCell>
                <TableCell className='text-right'>
                  {split.brand.isPlatform ? (
                    <span className='text-muted-foreground'>—</span>
                  ) : (
                    <>
                      {formatMoney(split.transferCents, currency)}
                      {split.reversedCents > 0 && (
                        <div className='text-muted-foreground text-xs'>
                          less {formatMoney(split.reversedCents, currency)}{' '}
                          reversed
                        </div>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell>{statusBadge(split)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <p className='text-muted-foreground text-xs'>
          Stripe took {formatMoney(stripeFeeCents, currency)} on this charge,
          apportioned to each brand by its share of the total.
        </p>
      </CardContent>
    </Card>
  )
}
