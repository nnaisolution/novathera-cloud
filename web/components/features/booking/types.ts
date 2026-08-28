import type { BookingDetailsInput } from "@/components/features/booking/schemas/booking-details";

export const BOOKING_PLACEHOLDER_IMAGE = "/booking/logo.png";

export type BookingWizardState = {
  details: BookingDetailsInput | null;
  city: string | null;
  locationId: string | null;
  locationName: string | null;
  locationTimezone: string | null;
  categoryId: string | null;
  serviceId: string | null;
  serviceName: string | null;
  priceCents: number | null;
  currency: string | null;
  clientCanChooseStaff: boolean;
  employeeId: string | null;
  employeeName: string | null;
  slotDate: string | null;
  slotTime: string | null;
  familyMemberId: string | null;
  familyMemberName: string | null;
};

export type BookingConfirmation = {
  bookingId: string;
};
