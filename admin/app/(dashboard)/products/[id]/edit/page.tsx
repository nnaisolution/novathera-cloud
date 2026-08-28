import { ProductFormView } from '@/components/features/products/components/product-form-view'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductFormView productId={id} />
}
