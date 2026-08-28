import { OrderDetailView } from '@/components/features/orders'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <OrderDetailView orderId={id} />
}
