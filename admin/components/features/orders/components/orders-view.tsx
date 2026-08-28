'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { IconReceipt } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { cn } from '@/lib/utils'
import { useOrders, type OrderStatus } from '../hooks/use-orders'

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'FULFILLED',
  'SHIPPED',
  'CANCELLED',
  'REFUNDED',
]

function formatMoney(cents: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

export function OrdersView() {
  const {
    data,
    isLoading,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
  } = useOrders()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Orders</h1>
        <p className='text-muted-foreground text-sm'>
          View and fulfill shop orders. Refunds are handled in Stripe Dashboard.
        </p>
      </div>

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconReceipt className='size-4' /> All Orders
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search order or customer…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='w-56'
            />
            <Select
              value={status ?? 'all'}
              onValueChange={(v) => {
                setStatus(v === 'all' ? undefined : (v as OrderStatus))
                setPage(1)
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !data?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No orders found.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className='font-mono text-sm'>
                        {order.orderCode}
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>{order.user.name}</div>
                        <div className='text-muted-foreground text-xs'>
                          {order.user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {order.items.reduce((sum, i) => sum + i.quantity, 0)}
                      </TableCell>
                      <TableCell>
                        {formatMoney(order.totalCents, order.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/orders/${order.id}`}
                          className={cn(
                            buttonVariants({ size: 'sm', variant: 'ghost' }),
                          )}
                        >
                          View
                        </Link>
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
