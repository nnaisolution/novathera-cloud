'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTRPC } from '@/lib/trpc/client'
import { useServiceMutations } from '../hooks/use-service-mutations'
import type { ServiceFormValues } from '../schemas/service.schema'
import {
  defaultServiceFormValues,
  mapServiceToForm,
} from '../utils/map-service-to-form'
import { ServiceForm } from './service-form'

export function ServiceFormView({ serviceId }: { serviceId?: string }) {
  const router = useRouter()
  const trpc = useTRPC()
  const isEdit = Boolean(serviceId)

  const { data: categoriesData } = useQuery(
    trpc.serviceCategories.list.queryOptions(),
  )
  const categories = categoriesData as
    | Array<{ id: string; name: string }>
    | undefined

  const { data, isLoading } = useQuery({
    ...trpc.services.getById.queryOptions({ id: serviceId! }),
    enabled: isEdit,
  })

  const { createService, updateService, isCreating, isUpdating } =
    useServiceMutations()

  const [formValues, setFormValues] = useState<ServiceFormValues>(
    defaultServiceFormValues,
  )

  useEffect(() => {
    if (isEdit && data) {
      setFormValues(mapServiceToForm(data as Parameters<typeof mapServiceToForm>[0]))
    } else if (!isEdit && categories?.[0]) {
      setFormValues((prev) => ({
        ...prev,
        categoryId: categories[0].id,
      }))
    }
  }, [isEdit, data, categories])

  if (isEdit && isLoading) {
    return <Skeleton className='h-96 w-full' />
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/services'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <IconArrowLeft className='size-4' />
        </Link>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {isEdit ? 'Edit Service' : 'Add Service'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {isEdit
              ? 'Update service details, pricing, and availability.'
              : 'Create a new service offering.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Service details</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm
            values={formValues}
            onChange={setFormValues}
            submitLabel={isEdit ? 'Save Changes' : 'Create Service'}
            isSubmitting={isCreating || isUpdating}
            onCancel={() => router.push('/services')}
            onSubmit={async () => {
              if (isEdit && serviceId) {
                await updateService(serviceId, formValues)
              } else {
                await createService(formValues)
              }
              router.push('/services')
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
