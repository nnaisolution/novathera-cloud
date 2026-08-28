"use client";

import Link from "next/link";

import { useMyOrders } from "@/components/features/orders/hooks/use-my-orders";

import { OrderCard } from "./order-card";

export function OrdersListView() {
  const { data, isLoading, isError, page, setPage } = useMyOrders();

  return (
    <div className="flex w-full flex-col items-start gap-2.5">
      <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
        My Orders
      </h1>
      <p className="text-base text-[#546256]">Your recent product purchases</p>

      <div className="mt-[30px] flex w-full flex-col gap-[30px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[327px] w-full animate-pulse rounded-[20px] bg-white"
            />
          ))
        ) : isError ? (
          <p className="rounded-[20px] bg-white py-12 text-center text-base text-[#546256]">
            Unable to load orders.
          </p>
        ) : data?.items.length ? (
          data.items.map((order) => <OrderCard key={order.id} order={order} />)
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[20px] bg-white py-16 text-center">
            <p className="text-base text-[#546256]">No orders yet.</p>
            <Link
              href="/shop"
              className="text-sm font-medium text-[#185b50] hover:underline"
            >
              Browse the shop
            </Link>
          </div>
        )}

        {data && data.totalPages > 1 ? (
          <div className="flex justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full border border-[#546256] px-4 py-2 text-sm text-[#546256] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="flex items-center text-sm text-[#546256]">
              Page {page} of {data.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-full border border-[#546256] px-4 py-2 text-sm text-[#546256] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
