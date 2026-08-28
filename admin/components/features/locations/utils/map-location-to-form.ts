import {
  defaultLocationFormValues,
  type LocationFormValues,
} from '../schemas/location.schema'

export function mapLocationToForm(
  location: Record<string, unknown>,
): LocationFormValues {
  return {
    name: String(location.name ?? ''),
    addressLine1: String(location.addressLine1 ?? ''),
    addressLine2: String(location.addressLine2 ?? ''),
    city: String(location.city ?? ''),
    province: String(location.province ?? ''),
    postalCode: String(location.postalCode ?? ''),
    country: String(location.country ?? 'CA'),
    phone: String(location.phone ?? ''),
    email: String(location.email ?? ''),
    googleMapsUrl: String(location.googleMapsUrl ?? ''),
    timezone: String(location.timezone ?? 'America/Edmonton'),
    operatingHours: location.operatingHours as LocationFormValues['operatingHours'],
    status: location.status as LocationFormValues['status'],
  }
}

export { defaultLocationFormValues }
