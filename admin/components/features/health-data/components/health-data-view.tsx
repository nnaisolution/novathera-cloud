'use client'

import { format } from 'date-fns'
import { IconHeartbeat } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useSession } from '@/lib/auth-client'
import { useHealthObservations } from '../hooks/use-health-observations'
import {
  HEALTH_OBSERVATION_TYPES,
  HEALTH_TYPE_LABELS,
  type HealthObservationType,
} from '../types'
import { formatObservationValue, formatPatientName } from '../utils/format'

const STAFF_ROLES = new Set(['admin', 'manager', 'staff'])

export function HealthDataView() {
  const { data: session } = useSession()
  const role = (session?.user as { role?: string | null } | undefined)?.role
  const roleName = typeof role === 'string' ? role.split(',')[0] : ''
  const allowed = STAFF_ROLES.has(roleName)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    type,
    setType,
    search,
    setSearch,
  } = useHealthObservations()

  if (!allowed) {
    return (
      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold tracking-tight'>Health Data</h1>
        <p className='text-muted-foreground text-sm'>
          This section is limited to admin and staff.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Health Data</h1>
        <p className='text-muted-foreground text-sm'>
          Observations are stored on the patient API, not Nest. They are not
          location-scoped — there is no locationId on the record.
        </p>
      </div>

      <Card>
        <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <IconHeartbeat className='size-4' /> Patient observations
          </CardTitle>
          <div className='flex flex-wrap gap-2'>
            <Input
              placeholder='Search patient name…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-56'
            />
            <Select
              value={type ?? 'all'}
              onValueChange={(value) =>
                setType(
                  value === 'all' ? undefined : (value as HealthObservationType),
                )
              }
            >
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All types</SelectItem>
                {HEALTH_OBSERVATION_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {HEALTH_TYPE_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {data && data.configured === false ? (
            <div className='text-muted-foreground space-y-2 py-8 text-sm'>
              <p className='text-foreground font-medium'>
                Patient API credentials are not configured.
              </p>
              <p>
                Health observations live in the Next.js patient API (
                <code>nova_thera_next</code>), not in Nest. Set these env vars
                and restart the admin app:
              </p>
              <ul className='list-inside list-disc space-y-1'>
                <li>
                  <code>NEXT_PUBLIC_PATIENT_API_URL</code> — patient API origin
                  (example: <code>http://localhost:3000</code>)
                </li>
                <li>
                  <code>PATIENT_API_STAFF_TOKEN</code> — server-only shared
                  secret
                </li>
                <li>
                  Matching <code>HEALTH_STAFF_API_KEY</code> on the patient API
                </li>
              </ul>
            </div>
          ) : isLoading ? (
            <div className='space-y-2'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className='h-12 w-full' />
              ))}
            </div>
          ) : isError ? (
            <div className='space-y-3 py-8 text-center'>
              <p className='text-muted-foreground text-sm'>
                {error instanceof Error
                  ? error.message
                  : 'Could not load observations.'}
              </p>
              <Button variant='outline' size='sm' onClick={() => void refetch()}>
                Retry
              </Button>
            </div>
          ) : !data?.items.length ? (
            <p className='text-muted-foreground py-8 text-center text-sm'>
              No observations found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Recorded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className='font-medium'>{formatPatientName(row)}</div>
                      <div className='text-muted-foreground font-mono text-xs'>
                        {row.patientId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='secondary'>
                        {HEALTH_TYPE_LABELS[row.type] ?? row.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatObservationValue(row)}</TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {row.source}
                    </TableCell>
                    <TableCell>
                      {format(new Date(row.effectiveAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
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
