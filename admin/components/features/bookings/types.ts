export type BookingListItem = {
  id: string
  bookingCode: string
  startTime: Date
  endTime: Date
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  paymentStatus: 'NONE' | 'PENDING' | 'PAID' | 'REFUNDED'
  customer: { id: string; name: string; email: string }
  employee: { id: string; firstName: string; lastName: string }
  service: { id: string; name: string }
  location: { id: string; name: string }
}
