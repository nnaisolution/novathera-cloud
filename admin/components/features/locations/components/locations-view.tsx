'use client'

import Link from 'next/link'
import { useState } from 'react'
import { IconMapPin, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { usePermission } from '@/lib/auth/use-permission'
import { useLocations } from '../hooks/use-locations'
import { useLocationMutations } from '../hooks/use-location-mutations'

const STATUS_LABELS = {
  OPEN: 'Open',
  COMING_SOON: 'Coming Soon',
  CLOSED: 'Closed',
} as const

function formatHoursSummary(
  hours: Array<{ day: string; isOpen: boolean; openTime: string; closeTime: string }>,
) {
  const openDays = hours.filter((h) => h.isOpen)
  if (openDays.length === 0) return 'Closed all week'
  const first = openDays[0]
  return `${openDays.length} days · ${first.openTime}–${first.closeTime}`
}

export function LocationsView() {
  const canCreate = usePermission('location', 'create')
  const canUpdate = usePermission('location', 'update')
  const canDelete = usePermission('location', 'delete')

  const { data, isLoading, page, setPage, search, setSearch, status, setStatus } =
    useLocations()
  const { deleteLocation, isDeleting } = useLocationMutations()

  const [deletingId, setDeletingId] = useState<string | null>(null)

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Locations</h1>
          <p className='text-muted-foreground text-sm'>
            Manage clinic branches, addresses, and operating hours.
          </p>
        </div>
        {canCreate && (
          <Link href='/locations/new' className={cn(buttonVariants())}>
            <IconPlus className='size-4' />
            Add Location
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconMapPin className='size-4' />
            All Locations
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search name or city...'
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className='w-56'
            />
            <Select
              value={status ?? 'all'}
              onValueChange={(v) => {
                setStatus(v === 'all' ? undefined : (v as typeof status))
                setPage(1)
              }}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='OPEN'>Open</SelectItem>
                <SelectItem value='COMING_SOON'>Coming Soon</SelectItem>
                <SelectItem value='CLOSED'>Closed</SelectItem>
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
              No locations found. {canCreate ? 'Add your first location to get started.' : ''}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    {(canUpdate || canDelete) && <TableHead className='w-24' />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className='font-medium'>{location.name}</TableCell>
                      <TableCell>{location.city}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {formatHoursSummary(
                          location.operatingHours as Parameters<typeof formatHoursSummary>[0],
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>
                          {STATUS_LABELS[location.status]}
                        </Badge>
                      </TableCell>
                      {(canUpdate || canDelete) && (
                        <TableCell>
                          <div className='flex gap-1'>
                            {canUpdate && (
                              <Link
                                href={`/locations/${location.id}/edit`}
                                className={cn(
                                  buttonVariants({ size: 'icon', variant: 'ghost' }),
                                )}
                              >
                                <IconPencil className='size-4' />
                              </Link>
                            )}
                            {canDelete && (
                              <Button
                                size='icon'
                                variant='ghost'
                                onClick={() => setDeletingId(location.id)}
                              >
                                <IconTrash className='size-4' />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
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

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete location?</AlertDialogTitle>
            <AlertDialogDescription>
              This will soft-delete the location. It can be restored from the database if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={async () => {
                if (deletingId) {
                  await deleteLocation(deletingId)
                  setDeletingId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
