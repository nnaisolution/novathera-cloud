import { LocationFormView } from '@/components/features/locations/components/location-form-view'

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LocationFormView locationId={id} />
}
