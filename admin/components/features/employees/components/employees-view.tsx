'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconPlus, IconUserCircle } from '@tabler/icons-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { usePermission } from '@/lib/auth/use-permission'
import { useEmployees } from '../hooks/use-employees'
import { useEmployeeMutations } from '../hooks/use-employee-mutations'
import { TEMP_PASSWORD_KEY } from './employee-form-view'

export function EmployeesView() {
  const canCreate = usePermission('employee', 'create')
  const canUpdate = usePermission('employee', 'update')
  const { data, isLoading, page, setPage, search, setSearch } = useEmployees()
  const { setStatus } = useEmployeeMutations()

  const [tempPassword, setTempPassword] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(TEMP_PASSWORD_KEY)
    if (stored) {
      setTempPassword(stored)
      sessionStorage.removeItem(TEMP_PASSWORD_KEY)
    }
  }, [])

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>Employees</h1>
          <p className='text-muted-foreground text-sm'>
            Manage staff profiles, roles, and certifications.
          </p>
        </div>
        {canCreate && (
          <Link href='/employees/new' className={cn(buttonVariants())}>
            <IconPlus className='size-4' /> Add Employee
          </Link>
        )}
      </div>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconUserCircle className='size-4' /> All Employees
          </CardTitle>
          <Input
            placeholder='Search...'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className='w-56'
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {canUpdate && <TableHead />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Avatar className='size-8'>
                          <AvatarImage src={emp.photoUrl ?? undefined} />
                          <AvatarFallback>
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium'>
                          {emp.firstName} {emp.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.employeeCode}</TableCell>
                    <TableCell>{emp.jobTitle}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      <Badge variant='outline'>
                        {String(emp.role ?? 'staff')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          emp.status === 'ACTIVE' ? 'default' : 'secondary'
                        }
                      >
                        {emp.status}
                      </Badge>
                    </TableCell>
                    {canUpdate && (
                      <TableCell>
                        <div className='flex gap-1'>
                          <Link
                            href={`/employees/${emp.id}/edit`}
                            className={cn(
                              buttonVariants({ size: 'sm', variant: 'ghost' }),
                            )}
                          >
                            Edit
                          </Link>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                              setStatus(
                                emp.id,
                                emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                              )
                            }
                          >
                            {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {data && data.totalPages > 1 && (
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
        </CardContent>
      </Card>

      <Dialog open={!!tempPassword} onOpenChange={() => setTempPassword(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Temporary Password</DialogTitle>
          </DialogHeader>
          <p className='text-sm'>
            Share this one-time password with the employee. They should change
            it on first login.
          </p>
          <code className='bg-muted block rounded p-3 text-sm'>
            {tempPassword}
          </code>
          <Button
            onClick={() => {
              void navigator.clipboard.writeText(tempPassword ?? '')
            }}
          >
            Copy
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
