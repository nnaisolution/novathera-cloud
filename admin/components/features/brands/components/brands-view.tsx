'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconExternalLink,
  IconPlus,
  IconRefresh,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useBrandMutations } from '../hooks/use-brand-mutations'
import type { BrandFormValues } from '../schemas/brand.schema'

type BrandItem = {
  id: string
  name: string
  slug: string
  tagline: string | null
  logoUrl: string | null
  displayOrder: number
  active: boolean
  isPlatform: boolean
  stripeAccountId: string | null
  chargesEnabled: boolean
  payoutsEnabled: boolean
  onboardingStatus: string
  requirementsDue: string[]
}

const emptyForm: BrandFormValues = {
  name: '',
  tagline: '',
  logoUrl: '',
  displayOrder: 0,
  active: true,
}

const ONBOARDING_LABEL: Record<string, string> = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  PENDING_VERIFICATION: 'Pending verification',
  COMPLETE: 'Ready for payouts',
  RESTRICTED: 'Restricted',
}

function payoutBadge(brand: BrandItem) {
  if (brand.isPlatform) {
    return <Badge variant='default'>Platform account</Badge>
  }
  if (brand.payoutsEnabled) {
    return <Badge variant='default'>Ready for payouts</Badge>
  }
  if (brand.onboardingStatus === 'RESTRICTED') {
    return <Badge variant='destructive'>Restricted</Badge>
  }
  return (
    <Badge variant='secondary'>
      {ONBOARDING_LABEL[brand.onboardingStatus] ?? brand.onboardingStatus}
    </Badge>
  )
}

export function BrandsView() {
  const trpc = useTRPC()
  const canCreate = usePermission('brand', 'create')
  const canUpdate = usePermission('brand', 'update')
  const canDelete = usePermission('brand', 'delete')
  const [form, setForm] = useState<BrandFormValues>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery(
    trpc.brands.list.queryOptions({
      page: 1,
      limit: 50,
      sortBy: 'displayOrder',
      sortOrder: 'asc',
    }),
  )

  const list = data as { items: BrandItem[] } | undefined
  const brands = list?.items ?? []
  const hasPlatform = brands.some((brand) => brand.isPlatform)

  const {
    createBrand,
    updateBrand,
    deleteBrand,
    setPlatform,
    startOnboarding,
    refreshStatus,
    isCreating,
    isUpdating,
    isOnboarding,
    isRefreshing,
  } = useBrandMutations()

  const startEdit = (brand: BrandItem) => {
    setEditingId(brand.id)
    setForm({
      name: brand.name,
      tagline: brand.tagline ?? '',
      logoUrl: brand.logoUrl ?? '',
      displayOrder: brand.displayOrder,
      active: brand.active,
    })
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Brands</h1>
        <p className='text-muted-foreground text-sm'>
          The businesses selling through the storefront. The platform brand owns
          the Stripe account customers pay; every other brand is paid by
          transfer after each order.
        </p>
      </div>

      {!isLoading && !hasPlatform && brands.length > 0 && (
        <Card className='border-destructive'>
          <CardContent className='flex items-start gap-3 pt-6'>
            <IconAlertTriangle className='text-destructive mt-0.5 size-5 shrink-0' />
            <div className='text-sm'>
              <p className='font-medium'>No platform brand set</p>
              <p className='text-muted-foreground'>
                One brand must own the Stripe account that takes payment.
                Checkout cannot allocate funds until this is set.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(canCreate || (canUpdate && editingId)) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-base'>
              <IconPlus className='size-4' />
              {editingId ? 'Edit brand' : 'New brand'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              <div className='space-y-2'>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='Beauty'
                />
              </div>
              <div className='space-y-2'>
                <Label>Tagline</Label>
                <Input
                  value={form.tagline ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, tagline: e.target.value })
                  }
                  placeholder='Optional'
                />
              </div>
              <div className='space-y-2'>
                <Label>Logo URL</Label>
                <Input
                  value={form.logoUrl ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                  placeholder='Optional'
                />
              </div>
              <div className='space-y-2'>
                <Label>Display order</Label>
                <Input
                  type='number'
                  min='0'
                  value={form.displayOrder}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      displayOrder: Number(e.target.value) || 0,
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
                    await updateBrand(editingId, form)
                  } else {
                    await createBrand(form)
                  }
                  resetForm()
                }}
              >
                {editingId ? 'Save changes' : 'Create brand'}
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
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconBuildingStore className='size-4' /> Brands
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : !brands.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No brands yet. Create one and mark it as the platform.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead>Status</TableHead>
                  {(canUpdate || canDelete) && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className='font-medium'>{brand.name}</div>
                      <div className='text-muted-foreground text-xs'>
                        /{brand.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.isPlatform ? (
                        <span className='text-sm'>Merchant of record</span>
                      ) : (
                        <span className='text-muted-foreground text-sm'>
                          Paid by transfer
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {brand.isPlatform ? (
                        <span className='text-muted-foreground text-xs'>
                          Platform account
                        </span>
                      ) : brand.stripeAccountId ? (
                        <code className='text-xs'>{brand.stripeAccountId}</code>
                      ) : (
                        <span className='text-muted-foreground text-xs'>
                          Not connected
                        </span>
                      )}
                      {brand.requirementsDue.length > 0 && (
                        <div className='text-muted-foreground mt-1 text-xs'>
                          {brand.requirementsDue.length} requirement(s)
                          outstanding
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col items-start gap-1'>
                        {payoutBadge(brand)}
                        {!brand.active && (
                          <Badge variant='secondary'>Inactive</Badge>
                        )}
                      </div>
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          {canUpdate && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => startEdit(brand)}
                            >
                              Edit
                            </Button>
                          )}
                          {canUpdate && !brand.isPlatform && (
                            <>
                              <Button
                                size='sm'
                                variant='ghost'
                                disabled={isOnboarding}
                                onClick={() => void startOnboarding(brand.id)}
                              >
                                <IconExternalLink className='size-3.5' />
                                {brand.stripeAccountId
                                  ? 'Continue onboarding'
                                  : 'Connect Stripe'}
                              </Button>
                              {brand.stripeAccountId && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  disabled={isRefreshing}
                                  onClick={() => void refreshStatus(brand.id)}
                                >
                                  <IconRefresh className='size-3.5' />
                                  Refresh
                                </Button>
                              )}
                              <Button
                                size='sm'
                                variant='ghost'
                                onClick={() => void setPlatform(brand.id)}
                              >
                                Make platform
                              </Button>
                            </>
                          )}
                          {canDelete && !brand.isPlatform && (
                            <Button
                              size='sm'
                              variant='ghost'
                              onClick={() => void deleteBrand(brand.id)}
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
