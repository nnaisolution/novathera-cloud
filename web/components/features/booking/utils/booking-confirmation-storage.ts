import type { BookingConfirmation } from "@/components/features/booking/types";

const CONFIRMATION_KEY = "nova-thera:booking-confirmation";

export function writeBookingConfirmation(confirmation: BookingConfirmation) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONFIRMATION_KEY, JSON.stringify(confirmation));
}

export function readBookingConfirmation(): BookingConfirmation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(CONFIRMATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BookingConfirmation;
    if (!parsed.bookingId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearBookingConfirmation() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONFIRMATION_KEY);
}
