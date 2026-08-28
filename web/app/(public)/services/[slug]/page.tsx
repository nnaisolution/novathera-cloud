import { ServiceDetailView } from "@/components/features/services";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  return <ServiceDetailView slug={slug} />;
}
