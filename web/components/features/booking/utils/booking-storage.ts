import type { BookingWizardState } from "@/components/features/booking/types";

const STORAGE_KEY = "nova-thera:booking-wizard";

const defaultState: BookingWizardState = {
  details: null,
  city: null,
  locationId: null,
  locationName: null,
  locationTimezone: null,
  categoryId: null,
  serviceId: null,
  serviceName: null,
  priceCents: null,
  currency: null,
  clientCanChooseStaff: false,
  employeeId: null,
  employeeName: null,
  slotDate: null,
  slotTime: null,
  familyMemberId: null,
  familyMemberName: null,
};

export function readBookingWizardState(): BookingWizardState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<BookingWizardState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function writeBookingWizardState(state: BookingWizardState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearBookingWizardState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}
