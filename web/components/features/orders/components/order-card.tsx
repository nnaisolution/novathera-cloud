"use client";

import Image from "next/image";
import { toast } from "sonner";

import { useCartActions } from "@/components/features/shop/hooks/use-cart";
import { siteNavigation } from "@/components/shared/site-navigation";
import type { Order } from "@/types/trpc/ecommerce";

import { ORDER_STATUS_LABELS, formatOrderMoney } from "../utils/format-order";

export function OrderCard({ order }: { order: Order }) {
  const { addItem } = useCartActions();

  function handleTrackOrder() {
    if (order.trackingNumber) {
      toast.info(`Tracking number: ${order.trackingNumber}`);
    } else {
      toast.info("This order hasn't shipped yet.");
    }
  }

  async function handleReorder() {
    const reorderable = order.items.filter((item) => item.productId);
    if (!reorderable.length) {
      toast.error("These items are no longer available to reorder.");
      return;
    }

    try {
      await Promise.all(
        reorderable.map((item) =>
          addItem.mutateAsync({
            productId: item.productId!,
            quantity: item.quantity,
          }),
        ),
      );
      window.location.href = siteNavigation.shop + "/cart";
    } catch {
      // addItem's own onError already surfaces a toast per failed item
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-5 rounded-[20px] bg-white p-[30px]">
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col items-start gap-2.5">
          <p className="text-sm tracking-[1.4px] text-[#546256]">
            ORDER {order.orderCode}
          </p>
          <p className="text-base text-[#185b50]">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2.5">
          <span className="inline-flex items-center justify-center rounded-full bg-[#185b50]/10 px-4 py-2 text-sm text-[#185b50]">
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <p className="font-serif text-2xl text-[#185b50]">
            {formatOrderMoney(order.totalCents, order.currency)}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-wrap gap-5">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex min-w-[260px] flex-1 items-center gap-5 rounded-[20px] bg-[#e5ebd8]/40 p-4"
          >
            <div className="relative size-[80px] shrink-0 overflow-hidden rounded-[10px] bg-white">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div className="flex flex-col items-start gap-2.5">
              <p className="text-lg text-[#185b50] uppercase">{item.name}</p>
              <p className="text-base text-[#546256]">Qty : {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={handleTrackOrder}
          className="h-[49px] rounded-full border border-[#546256] px-[21px] py-[15px] text-base leading-none text-[#546256] transition-colors hover:bg-[#546256]/5"
        >
          Track Order
        </button>
        <button
          type="button"
          onClick={handleReorder}
          disabled={addItem.isPending}
          className="h-[49px] rounded-full border border-[#546256] px-[21px] py-[15px] text-base leading-none text-[#546256] transition-colors hover:bg-[#546256]/5 disabled:opacity-60"
        >
          {addItem.isPending ? "Adding..." : "Reorder"}
        </button>
      </div>
    </div>
  );
}
