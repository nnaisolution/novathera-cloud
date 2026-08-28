'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTRPC } from '@/lib/trpc/client'
import { getTrpcErrorMessage } from '@/lib/trpc/error-message'
import type { ProductFormValues } from '../schemas/product.schema'
import { splitFacet } from '../utils/map-product-to-form'

function productToPayload(values: ProductFormValues) {
  return {
    name: values.name,
    description: values.description || undefined,
    ingredients: values.ingredients || undefined,
    howToUse: values.howToUse || undefined,
    status: values.status,
    priceCents: Math.round(values.price * 100),
    categoryId: values.categoryId || null,
    brandId: values.brandId,
    concerns: splitFacet(values.concerns),
    productTypes: splitFacet(values.productTypes),
    ingredientsFacet: splitFacet(values.ingredientsFacet),
    skinTypes: splitFacet(values.skinTypes),
    images: values.images.map((img, index) => ({
      url: img.url,
      alt: img.alt || undefined,
      sortOrder: img.sortOrder ?? index,
    })),
    inventoryQuantity: values.inventoryQuantity,
    lowStockThreshold: values.lowStockThreshold,
    allowBackorder: values.allowBackorder,
  }
}

export function useProductMutations() {
  const trpc = useTRPC()
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: trpc.products.list.queryKey() })
  }

  const createMutation = useMutation(
    trpc.products.create.mutationOptions({
      onSuccess: () => {
        toast.success('Product created')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const updateMutation = useMutation(
    trpc.products.update.mutationOptions({
      onSuccess: () => {
        toast.success('Product updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const archiveMutation = useMutation(
    trpc.products.archive.mutationOptions({
      onSuccess: () => {
        toast.success('Product archived')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  const setInventoryMutation = useMutation(
    trpc.products.setInventory.mutationOptions({
      onSuccess: () => {
        toast.success('Inventory updated')
        invalidate()
      },
      onError: (error: unknown) => toast.error(getTrpcErrorMessage(error)),
    }),
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const call = (mutation: any, input: unknown) =>
    mutation.mutateAsync(input) as Promise<unknown>

  return {
    createProduct: (values: ProductFormValues) =>
      call(createMutation, productToPayload(values)),
    updateProduct: (id: string, values: ProductFormValues) =>
      call(updateMutation, { id, ...productToPayload(values) }),
    archiveProduct: (id: string) => call(archiveMutation, { id }),
    publishProduct: (id: string) =>
      call(updateMutation, { id, status: 'ACTIVE' as const }),
    setInventory: (input: {
      productId: string
      quantity: number
      lowStockThreshold?: number
      allowBackorder?: boolean
    }) => call(setInventoryMutation, input),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  }
}
