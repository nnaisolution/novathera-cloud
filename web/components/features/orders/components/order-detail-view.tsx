"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ORDER_STATUS_LABELS,
  formatOrderMoney,
} from "@/components/features/orders/utils/format-order";
import { useMyOrder } from "@/components/features/orders/hooks/use-my-orders";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";

type OrderDetailViewProps = {
  orderId: string;
};

export function OrderDetailView({ orderId }: OrderDetailViewProps) {
  const orderQuery = useMyOrder(orderId);

  if (orderQuery.isLoading) {
    return (
      <div className="w-full max-w-3xl">
        <div className="h-40 animate-pulse rounded-2xl bg-[#f3f3f3]" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    notFound();
  }

  const order = orderQuery.data;

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/account/orders"
        className="text-sm text-[#185b50] underline underline-offset-4"
      >
        Back to orders
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium text-[#1a1c18]">
            {order.orderCode}
          </h1>
          <p className="mt-2 text-sm text-[#5c5f58]">
            Placed{" "}
            {new Date(order.createdAt).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className="rounded-full bg-[#eaf4f1] px-4 py-1.5 text-sm font-medium text-[#185b50]">
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <ul className="mt-8 space-y-4">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="flex gap-4 rounded-2xl border border-[#e8e8e8] p-4"
          >
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#edffe3]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  unoptimized={item.imageUrl.startsWith("http")}
                  className="object-cover"
                  sizes="80px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={shopRoutes.product(item.slug)}
                className="font-medium text-[#1a1c18] hover:underline"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-sm text-[#5c5f58]">
                Qty {item.quantity} &middot;{" "}
                {formatOrderMoney(item.unitPriceCents, order.currency)} each
              </p>
            </div>
            <p className="shrink-0 text-sm font-medium text-[#1a1c18]">
              {formatOrderMoney(
                item.unitPriceCents * item.quantity,
                order.currency,
              )}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2 rounded-2xl border border-[#e8e8e8] p-5 text-sm text-[#5c5f58]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatOrderMoney(order.subtotalCents, order.currency)}</span>
        </div>
        {order.discountCents > 0 ? (
          <div className="flex justify-between">
            <span>Discount</span>
            <span>
              -{formatOrderMoney(order.discountCents, order.currency)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{formatOrderMoney(order.shippingCents, order.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatOrderMoney(order.taxCents, order.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-[#e8e8e8] pt-2 text-base font-medium text-[#1a1c18]">
          <span>Total</span>
          <span>{formatOrderMoney(order.totalCents, order.currency)}</span>
        </div>
      </div>

      {(order.shippingLine1 || order.trackingNumber) && (
        <div className="mt-6 space-y-2 rounded-2xl border border-[#e8e8e8] p-5 text-sm text-[#5c5f58]">
          {order.shippingLine1 ? (
            <div>
              <p className="font-medium text-[#1a1c18]">Shipping address</p>
              <p className="mt-1">
                {order.shippingName}
                <br />
                {order.shippingLine1}
                {order.shippingLine2 ? (
                  <>
                    <br />
                    {order.shippingLine2}
                  </>
                ) : null}
                <br />
                {[order.shippingCity, order.shippingProvince, order.shippingPostalCode]
                  .filter(Boolean)
                  .join(", ")}
                {order.shippingCountry ? (
                  <>
                    <br />
                    {order.shippingCountry}
                  </>
                ) : null}
              </p>
            </div>
          ) : null}
          {order.trackingNumber ? (
            <p>
              Tracking:{" "}
              <span className="font-medium text-[#1a1c18]">
                {order.trackingNumber}
              </span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
