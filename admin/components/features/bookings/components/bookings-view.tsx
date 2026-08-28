'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  IconCalendarEvent,
  IconList,
  IconPlus,
} from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { useTRPC } from '@/lib/trpc/client'
import { BookingWizard } from './booking-wizard'
import { BookingsCalendar } from './bookings-calendar'
import { useBookings } from '../hooks/use-bookings'
import { useBookingMutations } from '../hooks/use-booking-mutations'

const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
} as const

const PAYMENT_LABELS = {
  NONE: 'None',
  PENDING: 'Pending',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
} as const

export function BookingsView() {
  const trpc = useTRPC()
  const canCreate = usePermission('booking', 'create')
  const canCancel = usePermission('booking', 'cancel')
  const canSetStatus = usePermission('booking', 'setStatus')
  const showEmployeeFilter = usePermission('booking', 'reschedule')

  const {
    data,
    isLoading,
    page,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    employeeId,
    setEmployeeId,
    locationId,
    setLocationId,
  } = useBookings()

  const {
    cancelBooking,
    markComplete,
    markNoShow,
    isCancelling,
  } = useBookingMutations()

  const { data: employeesRaw } = useQuery({
    ...trpc.employees.list.queryOptions({ page: 1, limit: 100, status: 'ACTIVE' }),
    enabled: showEmployeeFilter,
  })

  const { data: locationsRaw } = useQuery({
    ...trpc.locations.list.queryOptions({
      page: 1,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'asc',
    }),
    enabled: showEmployeeFilter,
  })

  const employeesData = employeesRaw as
    | { items: Array<{ id: string; firstName: string; lastName: string }> }
    | undefined

  const locationsData = locationsRaw as
    | { items: Array<{ id: string; name: string }> }
    | undefined

  const [wizardOpen, setWizardOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const filterBar = (
    <div className='flex flex-wrap gap-2'>
      <Input
        placeholder='Search customer...'
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className='w-48'
      />
      <Select
        value={status ?? 'all'}
        onValueChange={(v) => {
          setStatus(v === 'all' ? undefined : (v as typeof status))
          setPage(1)
        }}
      >
        <SelectTrigger className='w-36'>
          <SelectValue placeholder='Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All statuses</SelectItem>
          <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
          <SelectItem value='COMPLETED'>Completed</SelectItem>
          <SelectItem value='CANCELLED'>Cancelled</SelectItem>
          <SelectItem value='NO_SHOW'>No show</SelectItem>
        </SelectContent>
      </Select>
      {showEmployeeFilter && (
        <Select
          items={[
            { value: 'all', label: 'All employees' },
            ...(employeesData?.items.map((employee) => ({
              value: employee.id,
              label: `${employee.firstName} ${employee.lastName}`,
            })) ?? []),
          ]}
          value={employeeId ?? 'all'}
          onValueChange={(v) => {
            setEmployeeId(!v || v === 'all' ? undefined : v)
            setPage(1)
          }}
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Employee' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All employees</SelectItem>
            {employeesData?.items.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {showEmployeeFilter && (
        <Select
          value={locationId ?? 'all'}
          onValueChange={(v) => {
            setLocationId(!v || v === 'all' ? undefined : v)
            setPage(1)
          }}
        >
          <SelectTrigger className='w-44'>
            <SelectValue placeholder='Location' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All locations</SelectItem>
            {locationsData?.items.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Bookings</h1>
          <p className='text-muted-foreground text-sm'>
            Calendar and list views for appointments across locations and staff.
          </p>
        </div>
        <div className='flex flex-wrap gap-2'>
          {canCreate && (
            <Button onClick={() => setWizardOpen(true)}>
              <IconPlus className='size-4' />
              New booking
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue='calendar'>
        <Card>
          <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
            <TabsList>
              <TabsTrigger value='calendar'>
                <IconCalendarEvent className='size-4' />
                Calendar
              </TabsTrigger>
              <TabsTrigger value='list'>
                <IconList className='size-4' />
                List
              </TabsTrigger>
            </TabsList>
            {filterBar}
          </CardHeader>
          <CardContent>
            <TabsContent value='calendar' className='mt-0'>
              <BookingsCalendar
                search={search || undefined}
                status={status}
                employeeId={employeeId}
                locationId={locationId}
              />
            </TabsContent>

            <TabsContent value='list' className='mt-0'>
              {isLoading ? (
                <div className='space-y-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className='h-12 w-full' />
                  ))}
                </div>
              ) : !data?.items.length ? (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No bookings found.
                  {canCreate ? ' Create one to get started.' : ''}
                </p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Employee</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Start</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className='w-40' />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.items.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className='font-medium'>
                              {booking.customer.name}
                            </div>
                            <div className='text-muted-foreground text-xs'>
                              {booking.customer.email}
                            </div>
                          </TableCell>
                          <TableCell>{booking.service.name}</TableCell>
                          <TableCell>
                            {booking.employee.firstName}{' '}
                            {booking.employee.lastName}
                          </TableCell>
                          <TableCell>{booking.location.name}</TableCell>
                          <TableCell>
                            {format(
                              new Date(booking.startTime),
                              'MMM d, yyyy h:mm a',
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant='secondary'>
                              {STATUS_LABELS[booking.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {PAYMENT_LABELS[booking.paymentStatus]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {canSetStatus && booking.status === 'CONFIRMED' && (
                                <>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => void markComplete(booking.id)}
                                  >
                                    Complete
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='outline'
                                    onClick={() => void markNoShow(booking.id)}
                                  >
                                    No show
                                  </Button>
                                </>
                              )}
                              {canCancel && booking.status === 'CONFIRMED' && (
                                <Button
                                  size='sm'
                                  variant='ghost'
                                  onClick={() => setCancellingId(booking.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
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
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      {canCreate && (
        <BookingWizard open={wizardOpen} onOpenChange={setWizardOpen} />
      )}

      <AlertDialog open={!!cancellingId} onOpenChange={() => setCancellingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the booking as cancelled.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction
              disabled={isCancelling}
              onClick={async () => {
                if (cancellingId) {
                  await cancelBooking({ id: cancellingId })
                  setCancellingId(null)
                }
              }}
            >
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
