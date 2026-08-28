'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { IconArrowLeft } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { useOrderMutations } from '../hooks/use-order-mutations'
import { OrderBrandSplits } from './order-brand-splits'

function formatMoney(cents: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

type OrderDetail = {
  id: string
  orderCode: string
  status: string
  currency: string
  subtotalCents: number
  discountCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  trackingNumber: string | null
  createdAt: Date
  fulfilledAt: Date | null
  shippedAt: Date | null
  stripePaymentIntentId: string | null
  shippingName: string | null
  shippingLine1: string | null
  shippingLine2: string | null
  shippingCity: string | null
  shippingProvince: string | null
  shippingPostalCode: string | null
  shippingCountry: string | null
  isTest: boolean
  stripeChargeId: string | null
  stripeFeeCents: number
  brandSplits: Array<{
    id: string
    grossCents: number
    subtotalCents: number
    discountCents: number
    shippingCents: number
    taxCents: number
    stripeFeeCents: number
    transferCents: number
    reversedCents: number
    transferStatus: string
    transferError: string | null
    stripeTransferId: string | null
    brand: { id: string; name: string; isPlatform: boolean }
  }>
  user: { name: string; email: string }
  items: Array<{
    id: string
    name: string
    slug: string
    quantity: number
    unitPriceCents: number
    imageUrl: string | null
  }>
}

export function OrderDetailView({ orderId }: { orderId: string }) {
  const trpc = useTRPC()
  const canSetStatus = usePermission('order', 'setStatus')
  const canUpdate = usePermission('order', 'update')
  const {
    markFulfilled,
    markShipped,
    retryBrandTransfers,
    isUpdating,
    isRetryingTransfers,
  } = useOrderMutations()
  const [trackingNumber, setTrackingNumber] = useState('')

  const { data, isLoading } = useQuery(
    trpc.orders.getById.queryOptions({ id: orderId }),
  )

  const order = data as OrderDetail | undefined

  if (isLoading) {
    return <Skeleton className='h-96 w-full' />
  }

  if (!order) {
    return (
      <p className='text-muted-foreground py-8 text-center text-sm'>
        Order not found.
      </p>
    )
  }

  const addressParts = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingProvince, order.shippingPostalCode]
      .filter(Boolean)
      .join(', '),
    order.shippingCountry,
  ].filter(Boolean)

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center gap-4'>
        <Link
          href='/orders'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <IconArrowLeft className='size-4' />
        </Link>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Order {order.orderCode}
          </h1>
          <p className='text-muted-foreground text-sm'>
            Placed {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        {order.isTest && (
          <Badge variant='outline' className='text-sm'>
            Test mode
          </Badge>
        )}
        <Badge variant='secondary' className='text-sm'>
          {order.status}
        </Badge>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-base'>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Line</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className='font-medium'>{item.name}</div>
                      <div className='text-muted-foreground font-mono text-xs'>
                        {item.slug}
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {formatMoney(item.unitPriceCents, order.currency)}
                    </TableCell>
                    <TableCell>
                      {formatMoney(
                        item.unitPriceCents * item.quantity,
                        order.currency,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <OrderBrandSplits
          splits={order.brandSplits}
          currency={order.currency}
          stripeFeeCents={order.stripeFeeCents}
          canRetry={canUpdate}
          isRetrying={isRetryingTransfers}
          onRetry={() => void retryBrandTransfers(order.id)}
        />

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Amounts</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Subtotal</span>
                <span>{formatMoney(order.subtotalCents, order.currency)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Discount</span>
                <span>
                  −{formatMoney(order.discountCents, order.currency)}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shipping</span>
                <span>{formatMoney(order.shippingCents, order.currency)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Tax</span>
                <span>{formatMoney(order.taxCents, order.currency)}</span>
              </div>
              <div className='flex justify-between border-t pt-2 font-medium'>
                <span>Total</span>
                <span>{formatMoney(order.totalCents, order.currency)}</span>
              </div>
              {order.stripePaymentIntentId && (
                <p className='text-muted-foreground pt-2 font-mono text-xs'>
                  PI: {order.stripePaymentIntentId}
                </p>
              )}
              <p className='text-muted-foreground text-xs'>
                Refunds: use Stripe Dashboard.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Customer & shipping</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div>
                <div className='font-medium'>{order.user.name}</div>
                <div className='text-muted-foreground'>{order.user.email}</div>
              </div>
              {addressParts.length > 0 ? (
                <div className='space-y-0.5'>
                  {addressParts.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              ) : (
                <p className='text-muted-foreground'>No shipping address</p>
              )}
              {order.trackingNumber && (
                <div>
                  <span className='text-muted-foreground'>Tracking: </span>
                  <span className='font-mono'>{order.trackingNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {canSetStatus &&
            (order.status === 'PAID' || order.status === 'FULFILLED') && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Fulfillment</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {order.status === 'PAID' && (
                    <Button
                      disabled={isUpdating}
                      onClick={() => void markFulfilled(order.id)}
                    >
                      Mark fulfilled
                    </Button>
                  )}
                  {(order.status === 'PAID' ||
                    order.status === 'FULFILLED') && (
                    <div className='space-y-2'>
                      <Label>Tracking number</Label>
                      <Input
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder='Required to mark shipped'
                      />
                      <Button
                        disabled={isUpdating || !trackingNumber.trim()}
                        onClick={() =>
                          void markShipped(order.id, trackingNumber.trim())
                        }
                      >
                        Mark shipped
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  )
}
