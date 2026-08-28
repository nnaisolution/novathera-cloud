'use client'

import { useQuery } from '@tanstack/react-query'
import { addDays, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { authClient } from '@/lib/auth-client'
import { useTRPC } from '@/lib/trpc/client'
import { useAvailableSlots } from '../hooks/use-available-slots'
import { useBookingMutations } from '../hooks/use-booking-mutations'
import { localDateTimeToUtc } from '../utils/timezone'

type Slot = { time: string; employeeId: string }

type BookingWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingWizard({ open, onOpenChange }: BookingWizardProps) {
  const trpc = useTRPC()
  const { createBooking, isCreating } = useBookingMutations()

  const [customerUserId, setCustomerUserId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [locationId, setLocationId] = useState('')
  const [employeeId, setEmployeeId] = useState<string | undefined>()
  const [date, setDate] = useState<Date | undefined>()
  const [selectedSlot, setSelectedSlot] = useState<Slot | undefined>()
  const [notes, setNotes] = useState('')
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; email: string }>
  >([])

  const { data: servicesRaw } = useQuery(
    trpc.services.list.queryOptions({ page: 1, limit: 100, status: 'ACTIVE' }),
  )
  const { data: locationsRaw } = useQuery(
    trpc.locations.list.queryOptions({ page: 1, limit: 100, status: 'OPEN' }),
  )
  const { data: employeesRaw } = useQuery(
    trpc.employees.list.queryOptions({ page: 1, limit: 100, status: 'ACTIVE' }),
  )

  const servicesData = servicesRaw as
    | {
        items: Array<{
          id: string
          name: string
          clientCanChooseStaff: boolean
          anyAssignedStaff: boolean
          maxAdvanceBookingDays: number
          staff: Array<{ employeeId: string }>
        }>
      }
    | undefined
  const locationsData = locationsRaw as
    | { items: Array<{ id: string; name: string; timezone: string }> }
    | undefined
  const employeesData = employeesRaw as
    | {
        items: Array<{ id: string; firstName: string; lastName: string }>
      }
    | undefined

  const selectedService = servicesData?.items.find((s) => s.id === serviceId)
  const selectedLocation = locationsData?.items.find((l) => l.id === locationId)

  const assignedEmployeeIds = useMemo(() => {
    if (!selectedService) return new Set<string>()
    return new Set(
      (
        selectedService.staff as Array<{ employeeId: string }> | undefined
      )?.map((s) => s.employeeId) ?? [],
    )
  }, [selectedService])

  const filteredEmployees =
    employeesData?.items.filter((e) => assignedEmployeeIds.has(e.id)) ?? []

  const showAnyEmployee =
    selectedService?.clientCanChooseStaff !== false &&
    selectedService?.anyAssignedStaff !== false

  const slotsQuery = useAvailableSlots({
    serviceId: serviceId || undefined,
    locationId: locationId || undefined,
    date,
    employeeId,
  })
  const slots = slotsQuery.data as Array<{ time: string; employeeId: string }> | undefined

  useEffect(() => {
    if (!open) return
    void authClient.admin
      .listUsers({
        query: {
          filterField: 'role',
          filterValue: 'customer',
          filterOperator: 'eq',
          limit: 100,
        },
      })
      .then((res) => {
        const users = res.data?.users ?? []
        setCustomers(
          users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
          })),
        )
      })
  }, [open])

  useEffect(() => {
    setSelectedSlot(undefined)
  }, [serviceId, locationId, employeeId, date])

  const maxDate = selectedService
    ? addDays(new Date(), selectedService.maxAdvanceBookingDays)
    : addDays(new Date(), 60)

  const handleConfirm = async () => {
    if (
      !customerUserId ||
      !serviceId ||
      !locationId ||
      !date ||
      !selectedSlot ||
      !selectedLocation
    ) {
      return
    }

    const startTime = localDateTimeToUtc(
      date,
      selectedSlot.time,
      selectedLocation.timezone as string,
    )

    await createBooking({
      customerUserId,
      serviceId,
      employeeId: selectedSlot.employeeId,
      locationId,
      startTime,
      notes: notes || undefined,
    })

    onOpenChange(false)
    setCustomerUserId('')
    setServiceId('')
    setLocationId('')
    setEmployeeId(undefined)
    setDate(undefined)
    setSelectedSlot(undefined)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
          <DialogDescription>
            Choose a service, location, date, and available time slot.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Service</Label>
              <Select
                items={servicesData?.items.map((service) => ({
                  value: service.id,
                  label: service.name,
                }))}
                value={serviceId}
                onValueChange={(v) => setServiceId(v ?? '')}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select service' />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.items.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Location</Label>
              <Select
                items={locationsData?.items.map((location) => ({
                  value: location.id,
                  label: location.name,
                }))}
                value={locationId}
                onValueChange={(v) => setLocationId(v ?? '')}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select location' />
                </SelectTrigger>
                <SelectContent>
                  {locationsData?.items.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Employee</Label>
              <Select
                items={[
                  ...(showAnyEmployee
                    ? [{ value: 'any', label: 'Any available' }]
                    : []),
                  ...filteredEmployees.map((employee) => ({
                    value: employee.id,
                    label: `${employee.firstName} ${employee.lastName}`,
                  })),
                ]}
                value={employeeId ?? 'any'}
                onValueChange={(v) =>
                  setEmployeeId(!v || v === 'any' ? undefined : v)
                }
                disabled={!serviceId}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select employee' />
                </SelectTrigger>
                <SelectContent>
                  {showAnyEmployee && (
                    <SelectItem value='any'>Any available</SelectItem>
                  )}
                  {filteredEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>Customer</Label>
              <Select
                items={customers.map((customer) => ({
                  value: customer.id,
                  label: `${customer.name} (${customer.email})`,
                }))}
                value={customerUserId}
                onValueChange={(v) => setCustomerUserId(v ?? '')}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select customer' />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Date</Label>
              <Calendar
                mode='single'
                selected={date}
                onSelect={setDate}
                disabled={(d) =>
                  d < startOfDay(new Date()) || d > maxDate
                }
                className='rounded-md border'
              />
            </div>

            <div className='space-y-2'>
              <Label>Available times</Label>
              <div className='max-h-72 space-y-2 overflow-y-auto rounded-md border p-3'>
                {!serviceId || !locationId || !date ? (
                  <p className='text-muted-foreground text-sm'>
                    Select service, location, and date to see times.
                  </p>
                ) : slotsQuery.isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className='h-9 w-full' />
                  ))
                ) : !slots?.length ? (
                  <p className='text-muted-foreground text-sm'>
                    No times available for this day.
                  </p>
                ) : (
                  slots.map((slot) => (
                    <Button
                      key={`${slot.time}-${slot.employeeId}`}
                      type='button'
                      variant={
                        selectedSlot?.time === slot.time &&
                        selectedSlot.employeeId === slot.employeeId
                          ? 'default'
                          : 'outline'
                      }
                      className='w-full justify-start'
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.time}
                    </Button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Optional notes'
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              !customerUserId ||
              !serviceId ||
              !locationId ||
              !date ||
              !selectedSlot ||
              isCreating
            }
            onClick={() => void handleConfirm()}
          >
            {isCreating ? 'Creating…' : 'Confirm booking'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
