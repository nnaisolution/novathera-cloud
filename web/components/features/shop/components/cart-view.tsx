"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";

import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { useCart, useCartActions } from "@/components/features/shop/hooks/use-cart";
import { formatProductPrice } from "@/components/features/shop/shop-data";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { CartItem } from "@/types/trpc/ecommerce";

function CartItemCard({
  item,
  onDecrease,
  onIncrease,
  onRemove,
  isUpdating,
  isRemoving,
}: {
  item: CartItem;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
}) {
  const image = item.product.images[0];
  const totalCents = item.product.priceCents * item.quantity;

  return (
    <li className="flex w-full flex-col gap-[30px] rounded-[20px] bg-white p-[30px] sm:flex-row sm:items-start">
      <div className="relative size-[140px] shrink-0 overflow-hidden rounded-[10px] bg-[#edffe3]">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? item.product.name}
            fill
            unoptimized={image.url.startsWith("http")}
            className="object-cover"
            sizes="140px"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-[30px]">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-2.5">
            <Link
              href={shopRoutes.product(item.product.slug)}
              className="text-[24px] text-[#185b50] uppercase hover:underline"
            >
              {item.product.name}
            </Link>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-right">
            <p className="font-serif text-[28px] text-[#185b50]">
              {formatProductPrice(totalCents, item.product.currency)}
            </p>
            {item.quantity > 1 ? (
              <p className="text-base text-[#546256]">
                {formatProductPrice(
                  item.product.priceCents,
                  item.product.currency,
                )}{" "}
                each
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full items-end justify-between">
          <div className="flex items-center gap-5 rounded-2xl border border-black/50 px-5 py-4">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isUpdating}
              onClick={onDecrease}
              className="disabled:opacity-50"
            >
              <Minus className="size-5 text-[#185b50]" />
            </button>
            <span className="min-w-4 text-center text-[20px] text-[#185b50]">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isUpdating}
              onClick={onIncrease}
              className="disabled:opacity-50"
            >
              <Plus className="size-5 text-[#185b50]" />
            </button>
          </div>

          <button
            type="button"
            aria-label={`Remove ${item.product.name}`}
            disabled={isRemoving}
            onClick={onRemove}
            className="flex items-center gap-1.5 text-base text-[#546256] hover:text-[#185b50] disabled:opacity-50"
          >
            <Trash2 className="size-4" />
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}

export function CartView() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const cartQuery = useCart(Boolean(session?.user));
  const { updateQuantity, removeItem, checkout } = useCartActions();

  if (sessionPending) {
    return (
      <>
        <main className="min-h-screen bg-[#faf7ee]">
          <HomePageV2ScrollHeader overlayVariant="sticky" />
          <div className="mx-auto max-w-3xl px-6 py-28">
            <div className="h-40 animate-pulse rounded-2xl bg-[#edffe3]" />
          </div>
        </main>
        <HomePageV2FooterSection />
      </>
    );
  }

  if (!session?.user) {
    return (
      <>
        <main className="min-h-screen bg-[#faf7ee] text-[#185b50]">
          <HomePageV2ScrollHeader overlayVariant="sticky" />
          <section className="mx-auto max-w-3xl space-y-6 px-6 py-28 lg:py-32">
            <Link
              href={shopRoutes.root}
              className="text-sm underline underline-offset-4"
            >
              Back to shop
            </Link>
            <h1 className="font-serif text-4xl lg:text-5xl">Cart</h1>
            <p className="text-base text-[#185b50]/80">
              Sign in to view your cart and checkout.
            </p>
            <Button
              type="button"
              onClick={() =>
                router.push(`/login?next=${encodeURIComponent(pathname)}`)
              }
              className="h-12 rounded-2xl bg-[#185b50] px-8 text-white hover:bg-[#185b50]/90"
            >
              Sign in
            </Button>
          </section>
        </main>
        <HomePageV2FooterSection />
      </>
    );
  }

  const items = cartQuery.data?.items ?? [];
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const currency = items[0]?.product.currency ?? "CAD";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  async function handleCheckout() {
    const { url } = await checkout.mutateAsync({});
    window.location.href = url;
  }

  return (
    <>
      <main className="min-h-screen bg-[#faf7ee] text-[#185b50]">
        <div className="relative">
          <HomePageV2ScrollHeader overlayVariant="sticky" />
        </div>

        <section className="mx-auto max-w-7xl px-6 py-28 lg:px-20 lg:py-[100px]">
          <div className="flex flex-col items-start gap-5">
            <div className="flex items-center gap-2.5 text-base">
              <Link href={shopRoutes.root} className="hover:underline">
                Home
              </Link>
              <span>/</span>
              <span className="opacity-70">Cart</span>
            </div>
            <h1 className="font-serif text-[48px] leading-none">Your Cart</h1>
            {items.length > 0 ? (
              <p className="text-base">
                {itemCount} {itemCount === 1 ? "item" : "items"} reserved
              </p>
            ) : null}
          </div>

          {cartQuery.isLoading ? (
            <div className="mt-10 space-y-4">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-[20px] bg-[#edffe3]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-10 rounded-[20px] border border-[#e8e8e8] bg-white/50 px-6 py-16 text-center">
              <p className="text-base text-[#546256]">Your cart is empty.</p>
              <Link
                href={shopRoutes.root}
                className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-start gap-10 lg:flex-row">
              <ul className="flex w-full flex-1 flex-col gap-5">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    isUpdating={updateQuantity.isPending}
                    isRemoving={removeItem.isPending}
                    onDecrease={() =>
                      updateQuantity.mutate({
                        productId: item.productId,
                        quantity: item.quantity - 1,
                      })
                    }
                    onIncrease={() =>
                      updateQuantity.mutate({
                        productId: item.productId,
                        quantity: item.quantity + 1,
                      })
                    }
                    onRemove={() =>
                      removeItem.mutate({ productId: item.productId })
                    }
                  />
                ))}
              </ul>

              <div className="flex w-full flex-col gap-10 lg:w-[520px] lg:shrink-0">
                <div className="flex w-full flex-col items-start gap-[30px] rounded-[20px] bg-white p-[30px]">
                  <p className="font-serif text-[32px]">Order Summary</p>

                  <div className="flex w-full flex-col gap-5">
                    <div className="flex w-full items-center justify-between">
                      <p className="text-lg text-[#546256]">Subtotal</p>
                      <p className="text-xl font-semibold">
                        {formatProductPrice(subtotalCents, currency)}
                      </p>
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <p className="text-lg text-[#546256]">Shipping</p>
                      <p className="text-xl font-semibold">
                        Calculated at checkout
                      </p>
                    </div>
                  </div>

                  <div className="h-px w-full rounded-full bg-black/20" />

                  <div className="flex w-full items-center justify-between">
                    <p className="text-lg text-[#546256]">TOTAL</p>
                    <p className="font-serif text-[28px]">
                      {formatProductPrice(subtotalCents, currency)}
                    </p>
                  </div>

                  <div className="flex w-full flex-col items-center gap-5">
                    <button
                      type="button"
                      onClick={() => void handleCheckout()}
                      disabled={checkout.isPending}
                      className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#f3b94c] via-[#d68900] to-[#f3b94c] px-[30px] py-4 text-base font-semibold text-[#1b0e04] transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {checkout.isPending
                        ? "Redirecting to checkout..."
                        : "Proceed to checkout"}
                    </button>
                    <Link
                      href={shopRoutes.root}
                      className="text-base text-[#546256] hover:underline"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>

                <div className="flex w-full flex-col items-start gap-5 rounded-[20px] bg-[#185b50] p-[30px]">
                  <p className="text-sm tracking-[1.4px] text-white/50 uppercase">
                    Memberships
                  </p>
                  <p className="font-serif text-[32px] text-white">
                    {"Members save "}
                    <span className="text-[#bf913d]">10%</span>
                    {" on every order."}
                  </p>
                  <Link
                    href="/account/membership"
                    className="text-base text-[#bf913d] underline underline-offset-2"
                  >
                    View Membership
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
