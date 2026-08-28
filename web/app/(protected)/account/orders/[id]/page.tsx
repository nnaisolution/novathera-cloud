import { OrderDetailView } from "@/components/features/orders";

type OrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountOrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
