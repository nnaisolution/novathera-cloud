'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/lib/trpc/client'
import { useLocationMutations } from '../hooks/use-location-mutations'
import {
  defaultLocationFormValues,
  mapLocationToForm,
} from '../utils/map-location-to-form'
import { LocationForm } from './location-form'

export function LocationFormView({ locationId }: { locationId?: string }) {
  const router = useRouter()
  const trpc = useTRPC()
  const isEdit = Boolean(locationId)

  const { data, isLoading } = useQuery({
    ...trpc.locations.getById.queryOptions({ id: locationId! }),
    enabled: isEdit,
  })

  const { createLocation, updateLocation, isCreating, isUpdating } =
    useLocationMutations()

  if (isEdit && isLoading) {
    return <Skeleton className='h-96 w-full' />
  }

  const defaultValues =
    isEdit && data
      ? mapLocationToForm(data as Record<string, unknown>)
      : defaultLocationFormValues

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/locations'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <IconArrowLeft className='size-4' />
        </Link>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {isEdit ? 'Edit Location' : 'Add Location'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {isEdit
              ? 'Update branch details and operating hours.'
              : 'Create a new clinic branch.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Location details</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationForm
            key={locationId ?? 'new'}
            defaultValues={defaultValues}
            submitLabel={isEdit ? 'Save Changes' : 'Create Location'}
            isSubmitting={isCreating || isUpdating}
            onCancel={() => router.push('/locations')}
            onSubmit={async (values) => {
              if (isEdit && locationId) {
                await updateLocation(locationId, values)
              } else {
                await createLocation(values)
              }
              router.push('/locations')
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
