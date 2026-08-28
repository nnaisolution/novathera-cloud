'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconPlus, IconTruck } from '@tabler/icons-react'
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
import { Switch } from '@/components/ui/switch'
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
import { useShippingMutations } from '../hooks/use-shipping-mutations'
import type { ShippingTierFormValues } from '../schemas/shipping-tier.schema'

type ShippingTierItem = {
  id: string
  name: string
  rateCents: number
  freeOverCents: number | null
  minDeliveryDays: number | null
  maxDeliveryDays: number | null
  active: boolean
}

const emptyForm: ShippingTierFormValues = {
  name: '',
  rate: 0,
  freeOver: '',
  minDeliveryDays: '',
  maxDeliveryDays: '',
  active: true,
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(cents / 100)
}

function deliveryLabel(tier: ShippingTierItem) {
  if (tier.minDeliveryDays == null && tier.maxDeliveryDays == null) return '—'
  if (tier.minDeliveryDays != null && tier.maxDeliveryDays != null) {
    return `${tier.minDeliveryDays}–${tier.maxDeliveryDays} days`
  }
  if (tier.minDeliveryDays != null) return `${tier.minDeliveryDays}+ days`
  return `≤ ${tier.maxDeliveryDays} days`
}

export function ShippingView() {
  const trpc = useTRPC()
  const canCreate = usePermission('shipping', 'create')
  const canUpdate = usePermission('shipping', 'update')
  const canDelete = usePermission('shipping', 'delete')
  const [page, setPage] = useState(1)
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>()
  const [form, setForm] = useState<ShippingTierFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery(
    trpc.shippingTiers.list.queryOptions({
      page,
      limit: 50,
      active: activeFilter,
      sortBy: 'rateCents',
      sortOrder: 'asc',
    }),
  )

  const list = data as
    | { items: ShippingTierItem[]; totalPages: number }
    | undefined

  const { createTier, updateTier, deleteTier, isCreating, isUpdating } =
    useShippingMutations()

  const startEdit = (tier: ShippingTierItem) => {
    setEditingId(tier.id)
    setForm({
      name: tier.name,
      rate: tier.rateCents / 100,
      freeOver: tier.freeOverCents != null ? tier.freeOverCents / 100 : '',
      minDeliveryDays: tier.minDeliveryDays ?? '',
      maxDeliveryDays: tier.maxDeliveryDays ?? '',
      active: tier.active,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Shipping</h1>
        <p className='text-muted-foreground text-sm'>
          Manage shipping tiers, rates, and delivery estimates.
        </p>
      </div>

      {(canCreate || (canUpdate && editingId)) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconPlus className='size-4' />
              {editingId ? 'Edit shipping tier' : 'New shipping tier'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='Standard'
                />
              </div>
              <div className='space-y-2'>
                <Label>Rate ($)</Label>
                <Input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.rate || ''}
                  onChange={(e) =>
                    setForm({ ...form, rate: Number(e.target.value) })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>Free over ($)</Label>
                <Input
                  type='number'
                  min='0'
                  step='0.01'
                  value={form.freeOver === '' ? '' : form.freeOver}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      freeOver: e.target.value
                        ? Number(e.target.value)
                        : '',
                    })
                  }
                  placeholder='Optional'
                />
              </div>
              <div className='space-y-2'>
                <Label>Min delivery days</Label>
                <Input
                  type='number'
                  min='0'
                  value={
                    form.minDeliveryDays === '' ? '' : form.minDeliveryDays
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      minDeliveryDays: e.target.value
                        ? Number(e.target.value)
                        : '',
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label>Max delivery days</Label>
                <Input
                  type='number'
                  min='0'
                  value={
                    form.maxDeliveryDays === '' ? '' : form.maxDeliveryDays
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxDeliveryDays: e.target.value
                        ? Number(e.target.value)
                        : '',
                    })
                  }
                />
              </div>
              <div className='flex items-end gap-2 pb-2'>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm({ ...form, active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
            <div className='mt-4 flex gap-2'>
              <Button
                disabled={
                  isCreating ||
                  isUpdating ||
                  !form.name.trim() ||
                  (editingId ? !canUpdate : !canCreate)
                }
                onClick={async () => {
                  if (editingId) {
                    await updateTier(editingId, form)
                  } else {
                    await createTier(form)
                  }
                  resetForm()
                }}
              >
                {editingId ? 'Save changes' : 'Create tier'}
              </Button>
              {editingId && (
                <Button type='button' variant='outline' onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconTruck className='size-4' /> Shipping tiers
          </CardTitle>
          <Select
            value={
              activeFilter === undefined
                ? 'all'
                : activeFilter
                  ? 'active'
                  : 'inactive'
            }
            onValueChange={(v) => {
              setActiveFilter(v === 'all' ? undefined : v === 'active')
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !list?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No shipping tiers found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Free over</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Status</TableHead>
                  {(canUpdate || canDelete) && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.items.map((tier) => (
                  <TableRow key={tier.id}>
                    <TableCell className='font-medium'>{tier.name}</TableCell>
                    <TableCell>{formatMoney(tier.rateCents)}</TableCell>
                    <TableCell>
                      {tier.freeOverCents != null
                        ? formatMoney(tier.freeOverCents)
                        : '—'}
                    </TableCell>
                    <TableCell>{deliveryLabel(tier)}</TableCell>
                    <TableCell>
                      <Badge variant={tier.active ? 'default' : 'secondary'}>
                        {tier.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell>
                        <div className='flex gap-1'>
                          {canUpdate && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => startEdit(tier)}
                            >
                              Edit
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => void deleteTier(tier.id)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
