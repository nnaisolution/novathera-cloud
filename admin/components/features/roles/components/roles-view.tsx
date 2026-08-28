'use client'

import { IconCheck, IconMinus } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { roles, statement } from '@/lib/auth/permissions'
import {
  ROLE_LABELS,
  ROLE_SUMMARIES,
} from '@/components/features/staff/utils/roles'

const ROLE_ORDER = ['admin', 'manager', 'staff', 'receptionist'] as const

/** Human labels for resources whose key is not self-explanatory. */
const RESOURCE_LABELS: Record<string, string> = {
  user: 'Staff accounts',
  session: 'Sessions',
  analytics: 'Revenue analytics',
  setting: 'Clinic settings',
  audit: 'Audit log',
  employee: 'Employees',
  location: 'Locations',
  service: 'Services',
  booking: 'Bookings',
  payment: 'Payments',
  product: 'Products',
  order: 'Orders',
  discount: 'Discounts',
  shipping: 'Shipping',
  document: 'Documents',
}

type RoleStatements = Record<string, readonly string[] | undefined>

export function RolesView() {
  // `statement` and `roles` are generated from the backend by `trpc:sync`, so
  // this table can never drift from what the API actually enforces.
  const resources = Object.keys(statement).sort((a, b) =>
    (RESOURCE_LABELS[a] ?? a).localeCompare(RESOURCE_LABELS[b] ?? b),
  )

  const roleStatements = ROLE_ORDER.reduce<Record<string, RoleStatements>>(
    (accumulator, role) => {
      accumulator[role] = (
        roles[role as keyof typeof roles] as unknown as {
          statements: RoleStatements
        }
      ).statements
      return accumulator
    },
    {},
  )

  return (
    <div className='flex flex-col gap-6'>
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {ROLE_ORDER.map((role) => (
          <Card key={role} className='ring-foreground/10 shadow-none ring-1'>
            <CardContent className='space-y-1'>
              <Badge variant='secondary'>{ROLE_LABELS[role]}</Badge>
              <p className='text-muted-foreground text-xs'>
                {ROLE_SUMMARIES[role]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className='ring-foreground/10 shadow-none ring-1'>
        <CardHeader>
          <CardTitle>Permission matrix</CardTitle>
          <CardDescription>
            Editing roles requires a code change in the backend&apos;s
            <code className='mx-1'>permissions.ts</code>, followed by
            <code className='mx-1'>pnpm trpc:sync</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className='px-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-40'>Resource</TableHead>
                  {ROLE_ORDER.map((role) => (
                    <TableHead key={role}>{ROLE_LABELS[role]}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource}>
                    <TableCell className='font-medium'>
                      {RESOURCE_LABELS[resource] ?? resource}
                    </TableCell>
                    {ROLE_ORDER.map((role) => {
                      const actions = roleStatements[role]?.[resource]
                      return (
                        <TableCell key={role}>
                          {!actions || actions.length === 0 ? (
                            <IconMinus className='text-muted-foreground size-4' />
                          ) : (
                            <div className='flex flex-wrap gap-1'>
                              {actions.map((action) => (
                                <Badge
                                  key={action}
                                  variant='outline'
                                  className='gap-1 text-xs font-normal'
                                >
                                  <IconCheck className='size-3' />
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
