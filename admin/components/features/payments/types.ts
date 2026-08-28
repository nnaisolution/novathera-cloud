export type PaymentListItem = {
  id: string
  bookingCode: string
  startTime: Date
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  paymentStatus: 'NONE' | 'PENDING' | 'PAID' | 'REFUNDED'
  priceCents: number
  currency: string
  stripePaymentIntentId: string | null
  customer: { name: string; email: string }
  service: { name: string }
  location: { name: string }
}
