'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { IconDiscount, IconPlus } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { usePermission } from '@/lib/auth/use-permission'
import { useTRPC } from '@/lib/trpc/client'
import { useDiscountMutations } from '../hooks/use-discount-mutations'
import type { DiscountFormValues } from '../schemas/discount.schema'

type DiscountItem = {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  percentOff: number | null
  amountOffCents: number | null
  active: boolean
  expiresAt: Date | null
  createdAt: Date
}

const emptyForm: DiscountFormValues = {
  code: '',
  type: 'PERCENT',
  percentOff: 10,
  amountOff: undefined,
  expiresAt: '',
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100)
}

export function DiscountsView() {
  const trpc = useTRPC()
  const canCreate = usePermission('discount', 'create')
  const canUpdate = usePermission('discount', 'update')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true)
  const [form, setForm] = useState<DiscountFormValues>(emptyForm)

  const { data, isLoading } = useQuery(
    trpc.discounts.list.queryOptions({
      page,
      limit: 20,
      search: search || undefined,
      active: activeFilter,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  )

  const list = data as
    | { items: DiscountItem[]; totalPages: number }
    | undefined

  const { createDiscount, deactivateDiscount, isCreating } =
    useDiscountMutations()

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Discounts</h1>
        <p className='text-muted-foreground text-sm'>
          Create and deactivate promo codes for checkout.
        </p>
      </div>

      {canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconPlus className='size-4' /> New promo code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
              <div className='space-y-2'>
                <Label>Code</Label>
                <Input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder='WELCOME10'
                  className='font-mono uppercase'
                />
              </div>
              <div className='space-y-2'>
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      type: v as DiscountFormValues['type'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PERCENT'>Percent</SelectItem>
                    <SelectItem value='FIXED'>Fixed amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.type === 'PERCENT' ? (
                <div className='space-y-2'>
                  <Label>Percent off</Label>
                  <Input
                    type='number'
                    min='1'
                    max='100'
                    value={form.percentOff ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        percentOff: Number(e.target.value),
                      })
                    }
                  />
                </div>
              ) : (
                <div className='space-y-2'>
                  <Label>Amount off ($)</Label>
                  <Input
                    type='number'
                    min='0'
                    step='0.01'
                    value={form.amountOff ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amountOff: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
              <div className='space-y-2'>
                <Label>Expires</Label>
                <Input
                  type='date'
                  value={form.expiresAt ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className='flex items-end'>
                <Button
                  disabled={isCreating || !form.code.trim()}
                  onClick={async () => {
                    await createDiscount(form)
                    setForm(emptyForm)
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconDiscount className='size-4' /> Promo codes
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search codes…'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='w-48'
            />
            <Select
              value={
                activeFilter === undefined
                  ? 'all'
                  : activeFilter
                    ? 'active'
                    : 'inactive'
              }
              onValueChange={(v) => {
                setActiveFilter(
                  v === 'all' ? undefined : v === 'active',
                )
                setPage(1)
              }}
            >
              <SelectTrigger className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !list?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No discounts found.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    {canUpdate && <TableHead />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.items.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className='font-mono font-medium'>
                        {d.code}
                      </TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>
                        {d.type === 'PERCENT'
                          ? `${d.percentOff}%`
                          : formatMoney(d.amountOffCents ?? 0)}
                      </TableCell>
                      <TableCell>
                        {d.expiresAt
                          ? format(new Date(d.expiresAt), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={d.active ? 'default' : 'secondary'}>
                          {d.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      {canUpdate && (
                        <TableCell>
                          {d.active && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => void deactivateDiscount(d.id)}
                            >
                              Deactivate
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {list.totalPages > 1 && (
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
                    Page {page} of {list.totalPages}
                  </span>
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={page >= list.totalPages}
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
