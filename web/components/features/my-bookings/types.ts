export type MyBookingItem = {
  id: string;
  bookingCode: string;
  startTime: Date;
  durationMinutes: number;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus: "NONE" | "PENDING" | "PAID" | "REFUNDED";
  priceCents: number;
  currency: string;
  service: { id: string; name: string };
  location: { id: string; name: string; timezone: string };
  employee: { id: string; firstName: string; lastName: string };
};
