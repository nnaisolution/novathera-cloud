import type { ServiceFormValues } from '../schemas/service.schema'

export const defaultServiceFormValues: ServiceFormValues = {
  name: '',
  categoryId: '',
  shortDescription: '',
  detailedDescription: '',
  imageUrl: '',
  tags: '',
  status: 'DRAFT',
  durationMinutes: 60,
  bufferAfterMinutes: 0,
  minAdvanceBookingMinutes: 0,
  maxAdvanceBookingDays: 60,
  requiresConsultation: false,
  standardPrice: 0,
  memberPrice: undefined,
  taxApplicable: true,
  depositRequired: false,
  depositAmount: undefined,
  anyAssignedStaff: true,
  clientCanChooseStaff: true,
  staffEmployeeIds: [],
  locations: [],
}

type ServiceRecord = Record<string, unknown> & {
  name: string
  categoryId: string
  shortDescription?: string | null
  detailedDescription?: string | null
  imageUrl?: string | null
  tags: string[]
  status: string
  durationMinutes: number
  bufferAfterMinutes: number
  minAdvanceBookingMinutes: number
  maxAdvanceBookingDays: number
  requiresConsultation: boolean
  standardPriceCents: number
  memberPriceCents?: number | null
  taxApplicable: boolean
  depositRequired: boolean
  depositAmountCents?: number | null
  anyAssignedStaff: boolean
  clientCanChooseStaff: boolean
  staff: { employeeId: string }[]
  locations: {
    locationId: string
    isAvailable: boolean
    priceOverrideCents?: number | null
    durationOverrideMinutes?: number | null
    roomOrEquipment?: string | null
  }[]
}

export function mapServiceToForm(service: ServiceRecord): ServiceFormValues {
  return {
    name: service.name,
    categoryId: service.categoryId,
    shortDescription: service.shortDescription ?? '',
    detailedDescription: service.detailedDescription ?? '',
    imageUrl: service.imageUrl ?? '',
    tags: service.tags.join(', '),
    status: service.status as ServiceFormValues['status'],
    durationMinutes: service.durationMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    minAdvanceBookingMinutes: service.minAdvanceBookingMinutes,
    maxAdvanceBookingDays: service.maxAdvanceBookingDays,
    requiresConsultation: service.requiresConsultation,
    standardPrice: service.standardPriceCents / 100,
    memberPrice: service.memberPriceCents
      ? service.memberPriceCents / 100
      : undefined,
    taxApplicable: service.taxApplicable,
    depositRequired: service.depositRequired,
    depositAmount: service.depositAmountCents
      ? service.depositAmountCents / 100
      : undefined,
    anyAssignedStaff: service.anyAssignedStaff,
    clientCanChooseStaff: service.clientCanChooseStaff,
    staffEmployeeIds: service.staff.map((st) => st.employeeId),
    locations: service.locations.map((l) => ({
      locationId: l.locationId,
      isAvailable: l.isAvailable,
      priceOverride: l.priceOverrideCents
        ? l.priceOverrideCents / 100
        : undefined,
      durationOverrideMinutes: l.durationOverrideMinutes ?? undefined,
      roomOrEquipment: l.roomOrEquipment ?? '',
    })),
  }
}
