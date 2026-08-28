'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { IconArrowLeft } from '@tabler/icons-react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useTRPC } from '@/lib/trpc/client'
import { useProductMutations } from '../hooks/use-product-mutations'
import type { ProductFormValues } from '../schemas/product.schema'
import {
  defaultProductFormValues,
  mapProductToForm,
} from '../utils/map-product-to-form'
import { ProductForm } from './product-form'

export function ProductFormView({ productId }: { productId?: string }) {
  const router = useRouter()
  const trpc = useTRPC()
  const isEdit = Boolean(productId)

  const { data, isLoading } = useQuery({
    ...trpc.products.getById.queryOptions({ id: productId! }),
    enabled: isEdit,
  })

  const { createProduct, updateProduct, isCreating, isUpdating } =
    useProductMutations()

  const [formValues, setFormValues] = useState<ProductFormValues>(
    defaultProductFormValues,
  )

  useEffect(() => {
    if (isEdit && data) {
      setFormValues(
        mapProductToForm(data as Parameters<typeof mapProductToForm>[0]),
      )
    }
  }, [isEdit, data])

  if (isEdit && isLoading) {
    return <Skeleton className='h-96 w-full' />
  }

  const slug =
    isEdit && data && typeof data === 'object' && 'slug' in data
      ? String((data as { slug: string }).slug)
      : undefined

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-4'>
        <Link
          href='/products'
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}
        >
          <IconArrowLeft className='size-4' />
        </Link>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {isEdit
              ? 'Update catalog details, images, and inventory.'
              : 'Create a new shop product.'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            values={formValues}
            onChange={setFormValues}
            slug={slug}
            submitLabel={isEdit ? 'Save Changes' : 'Create Product'}
            isSubmitting={isCreating || isUpdating}
            onCancel={() => router.push('/products')}
            onSubmit={async () => {
              if (isEdit && productId) {
                await updateProduct(productId, formValues)
              } else {
                await createProduct(formValues)
              }
              router.push('/products')
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
