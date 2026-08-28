"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import {
  ORDER_STATUS_LABELS,
  formatOrderMoney,
} from "@/components/features/orders/utils/format-order";
import { useOrderBySessionId } from "@/components/features/orders/hooks/use-my-orders";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";

const primaryBtn =
  "inline-flex h-12 items-center justify-center rounded-2xl bg-[#185b50] px-8 text-white transition-opacity hover:opacity-90";
const secondaryBtn =
  "inline-flex h-12 items-center justify-center rounded-2xl border border-[#185b50] px-8 text-[#185b50]";

export function CheckoutSuccessView() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") ?? searchParams.get("checkout_id");
  const orderQuery = useOrderBySessionId(sessionId);

  return (
    <>
      <main className="min-h-screen bg-[#faf7ee] text-[#185b50]">
        <HomePageV2ScrollHeader overlayVariant="sticky" />
        <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-28 text-center lg:py-32">
          {!sessionId ? (
            <>
              <h1 className="font-display text-4xl">Checkout</h1>
              <p className="text-base text-[#546256]">
                Missing checkout session. If you completed payment, find your
                order under Account.
              </p>
              <Link href="/account/orders" className={primaryBtn}>
                View orders
              </Link>
            </>
          ) : orderQuery.isLoading ||
            (!orderQuery.data && !orderQuery.isError) ? (
            <>
              <Loader2 className="size-8 animate-spin text-[#185b50]" />
              <h1 className="font-display text-4xl">Confirming your order</h1>
              <p className="text-base text-[#546256]">
                Payment received. We&apos;re finalizing your order details…
              </p>
            </>
          ) : orderQuery.isError || !orderQuery.data ? (
            <>
              <h1 className="font-display text-4xl">Thanks for your order</h1>
              <p className="text-base text-[#546256]">
                Payment succeeded. Your order may take a moment to appear —
                check Orders shortly.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/account/orders" className={primaryBtn}>
                  View orders
                </Link>
                <Link href={shopRoutes.root} className={secondaryBtn}>
                  Continue shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-4xl">Order confirmed</h1>
              <p className="text-base text-[#546256]">
                {orderQuery.data.orderCode} &middot;{" "}
                {ORDER_STATUS_LABELS[orderQuery.data.status]}
              </p>
              <p className="text-2xl font-medium">
                {formatOrderMoney(
                  orderQuery.data.totalCents,
                  orderQuery.data.currency,
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/account/orders/${orderQuery.data.id}`}
                  className={primaryBtn}
                >
                  View order
                </Link>
                <Link href={shopRoutes.root} className={secondaryBtn}>
                  Continue shopping
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
