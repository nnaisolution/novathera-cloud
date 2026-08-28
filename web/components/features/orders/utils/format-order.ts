import type { OrderStatus } from "@/types/trpc/ecommerce";

export function formatOrderMoney(cents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FULFILLED: "Fulfilled",
  SHIPPED: "Shipped",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};
