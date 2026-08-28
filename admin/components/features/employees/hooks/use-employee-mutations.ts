'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { EmployeeFormValues } from '../schemas/employee.schema'

function toPayload(values: EmployeeFormValues) {
  return {
    ...values,
    photoUrl: values.photoUrl || undefined,
    dateOfBirth: values.dateOfBirth ? new Date(values.dateOfBirth) : undefined,
    personalPhone: values.personalPhone || undefined,
    personalEmail: values.personalEmail || undefined,
    emergencyContactName: values.emergencyContactName || undefined,
    emergencyContactPhone: values.emergencyContactPhone || undefined,
    locationId: values.locationId || undefined,
    maxDailyAppointments: values.maxDailyAppointments || undefined,
    certifications: values.certifications.map((c) => ({
      ...c,
      qualification: c.qualification || undefined,
      licenseNumber: c.licenseNumber || undefined,
      expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined,
    })),
    startDate: new Date(values.startDate),
  }
}

export function useEmployeeMutations() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.employees.list.queryKey() })

  const createMutation = useMutation(
    trpc.employees.create.mutationOptions({
      onSuccess: () => { toast.success('Employee created'); void invalidate() },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const updateMutation = useMutation(
    trpc.employees.update.mutationOptions({
      onSuccess: () => { toast.success('Employee updated'); void invalidate() },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const setStatusMutation = useMutation(
    trpc.employees.setStatus.mutationOptions({
      onSuccess: () => { toast.success('Status updated'); void invalidate() },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const deleteMutation = useMutation(
    trpc.employees.delete.mutationOptions({
      onSuccess: () => { toast.success('Employee deleted'); void invalidate() },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) => mutation.mutateAsync(input) as Promise<unknown>

  return {
    createEmployee: (values: EmployeeFormValues) =>
      call(createMutation, toPayload(values)),
    updateEmployee: (id: string, values: EmployeeFormValues) =>
      call(updateMutation, { id, ...toPayload(values) }),
    setStatus: (id: string, status: 'ACTIVE' | 'INACTIVE') =>
      call(setStatusMutation, { id, status }),
    deleteEmployee: (id: string) =>
      call(deleteMutation, { id }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
