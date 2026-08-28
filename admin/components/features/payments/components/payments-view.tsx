'use client'

import { format } from 'date-fns'
import { IconCreditCard, IconCopy } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePayments } from '../hooks/use-payments'

const PAYMENT_LABELS = {
  NONE: 'None',
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
} as const

const PAYMENT_BADGE_VARIANT = {
  NONE: 'outline',
  PENDING: 'outline',
  PAID: 'default',
  REFUNDED: 'secondary',
} as const

function formatAmount(priceCents: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(priceCents / 100)
}

function dateInputValue(date: Date | undefined) {
  if (!date) return ''
  return format(date, 'yyyy-MM-dd')
}

function parseDateInput(value: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

export function PaymentsView() {
  const {
    data,
    isLoading,
    isError,
    page,
    setPage,
    search,
    setSearch,
    paymentStatus,
    setPaymentStatus,
    from,
    setFrom,
    to,
    setTo,
  } = usePayments()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Payments</h1>
        <p className='text-muted-foreground text-sm'>
          Booking payments across all locations.
        </p>
      </div>

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconCreditCard className='size-4' /> All Payments
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search booking or customer...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='w-56'
            />
            <Select
              value={paymentStatus ?? 'all'}
              onValueChange={(v) => {
                setPaymentStatus(
                  v === 'all' ? undefined : (v as typeof paymentStatus),
                )
                setPage(1)
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='PAID'>Paid</SelectItem>
                <SelectItem value='REFUNDED'>Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type='date'
              value={dateInputValue(from)}
              onChange={(e) => {
                setFrom(parseDateInput(e.target.value))
                setPage(1)
              }}
              className='w-40'
            />
            <Input
              type='date'
              value={dateInputValue(to)}
              onChange={(e) => {
                setTo(parseDateInput(e.target.value))
                setPage(1)
              }}
              className='w-40'
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : isError ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              You don&apos;t have permission to view payments.
            </p>
          ) : !data?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No payments found.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Intent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {format(new Date(payment.startTime), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{payment.bookingCode}</TableCell>
                      <TableCell>
                        <div className='font-medium'>
                          {payment.customer.name}
                        </div>
                        <div className='text-muted-foreground text-xs'>
                          {payment.customer.email}
                        </div>
                      </TableCell>
                      <TableCell>{payment.service.name}</TableCell>
                      <TableCell>{payment.location.name}</TableCell>
                      <TableCell>
                        {formatAmount(payment.priceCents, payment.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={PAYMENT_BADGE_VARIANT[payment.paymentStatus]}>
                          {PAYMENT_LABELS[payment.paymentStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.stripePaymentIntentId ? (
                          <div className='flex items-center gap-1'>
                            <span className='font-mono text-xs'>
                              {payment.stripePaymentIntentId.slice(0, 12)}...
                            </span>
                            <Button
                              size='icon-xs'
                              variant='ghost'
                              onClick={() => {
                                void navigator.clipboard.writeText(
                                  payment.stripePaymentIntentId ?? '',
                                )
                                toast.success('Payment intent ID copied')
                              }}
                            >
                              <IconCopy className='size-3' />
                            </Button>
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.totalPages > 1 && (
                <div className='mt-4 flex justify-center gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className='text-muted-foreground flex items-center text-sm'>
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= data.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
