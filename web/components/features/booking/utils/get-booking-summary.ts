import type { BookingWizardState } from "@/components/features/booking/types";
import { formatBookingOverviewDateTime } from "@/components/features/booking/utils/booking-slot-dates";

export type BookingSummary = {
  serviceName: string;
  dateTimeLabel: string;
  locationName: string;
  staffName: string | null;
  priceLabel: string | null;
};

export function getBookingSummary(
  state: Pick<
    BookingWizardState,
    | "serviceId"
    | "serviceName"
    | "locationId"
    | "locationName"
    | "slotDate"
    | "slotTime"
    | "employeeName"
    | "priceCents"
    | "currency"
  >,
): BookingSummary | null {
  if (
    !state.serviceId ||
    !state.locationId ||
    !state.slotDate ||
    !state.slotTime
  ) {
    return null;
  }

  return {
    serviceName: state.serviceName ?? "Service",
    dateTimeLabel: formatBookingOverviewDateTime(
      state.slotDate,
      state.slotTime,
    ),
    locationName: state.locationName ?? "Clinic",
    staffName: state.employeeName,
    priceLabel:
      state.priceCents != null && state.currency
        ? new Intl.NumberFormat("en-CA", {
            style: "currency",
            currency: state.currency,
          }).format(state.priceCents / 100)
        : null,
  };
}
