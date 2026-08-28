"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  CreditCard,
  Minus,
  Package,
  Plus,
  RotateCcw,
} from "lucide-react";

import { useCartActions } from "@/components/features/shop/hooks/use-cart";
import {
  formatProductPrice,
  productDetailTrustItems,
} from "@/components/features/shop/shop-data";
import type { Product } from "@/components/features/shop/types";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";
import { siteNavigation } from "@/components/shared/site-navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type AccordionId = "information" | "ingredients" | "howToUse";

const accordionItems: {
  id: AccordionId;
  title: string;
  contentKey: keyof Product["detail"];
}[] = [
  {
    id: "information",
    title: "Product Information",
    contentKey: "information",
  },
  {
    id: "ingredients",
    title: "Key Ingredients",
    contentKey: "keyIngredients",
  },
  { id: "howToUse", title: "How to use", contentKey: "howToUse" },
];

const trustIcons = {
  shipping: Package,
  return: RotateCcw,
  checkout: CreditCard,
} as const;

type ProductDetailBuyBoxProps = {
  product: Product;
  className?: string;
};

export function ProductDetailBuyBox({
  product,
  className,
}: ProductDetailBuyBoxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { addItem, checkout } = useCartActions();
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<AccordionId | null>(
    "information",
  );

  function requireAuth() {
    if (session?.user) return true;
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
    return false;
  }

  function decreaseQty() {
    setQuantity((value) => Math.max(1, value - 1));
  }

  function increaseQty() {
    setQuantity((value) => value + 1);
  }

  async function handleAddToCart() {
    if (!requireAuth()) return;
    await addItem.mutateAsync({ productId: product.id, quantity });
  }

  async function handleBuyNow() {
    if (!requireAuth()) return;
    await addItem.mutateAsync({ productId: product.id, quantity });
    const { url } = await checkout.mutateAsync({});
    window.location.href = url;
  }

  const isBusy = addItem.isPending || checkout.isPending;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-10 lg:sticky lg:top-28 lg:max-w-[765px] lg:pl-[40px] xl:pl-[60px]",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-5">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2.5 text-base text-[#185b50]"
          >
            <Link href={siteNavigation.home} className="hover:opacity-70">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href={shopRoutes.root} className="hover:opacity-70">
              {product.breadcrumbCategory}
            </Link>
            <span aria-hidden>/</span>
            <span className="opacity-70">{product.name}</span>
          </nav>

          {product.brandName ? (
            <span className="inline-flex h-10 w-fit items-center rounded-[40px] bg-[#185b50] px-5 text-base text-white">
              {product.brandName}
            </span>
          ) : null}
          <span className="inline-flex h-10 w-fit items-center rounded-[40px] bg-white px-5 text-base text-[#185b50]">
            {product.categoryLabel}
          </span>
        </div>

        <h1 className="font-display text-4xl text-[#185b50] lg:text-[48px] lg:leading-none">
          {product.name}
        </h1>
      </div>

      <p className="text-[32px] text-[#185b50] lg:text-[40px] lg:leading-none">
        {formatProductPrice(product.priceCents, product.currency)}
      </p>

      <p className="text-base leading-normal text-[#185b50]">
        {product.description}
      </p>

      {product.inStock ? (
        <div className="flex items-center gap-1.5">
          <Check className="size-5 text-[#1db000]" strokeWidth={2.5} />
          <p className="text-lg text-[#1db000]">In - stock and ready to ship</p>
        </div>
      ) : (
        <p className="text-lg text-[#666]">Out of stock</p>
      )}

      <div className="flex w-full flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-5">
          <div className="flex h-[60px] shrink-0 items-center justify-center gap-5 rounded-2xl border border-black/50 px-5">
            <button
              type="button"
              onClick={decreaseQty}
              aria-label="Decrease quantity"
              className="flex size-5 items-center justify-center text-[#185b50]"
            >
              <Minus className="size-5" />
            </button>
            <span className="min-w-3 text-center text-xl text-[#185b50]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increaseQty}
              aria-label="Increase quantity"
              className="flex size-5 items-center justify-center text-[#185b50]"
            >
              <Plus className="size-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock || isBusy}
            className="flex h-[60px] flex-1 items-center justify-center rounded-2xl bg-[rgba(24,91,80,0.2)] px-[30px] text-lg text-[#185b50] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {addItem.isPending ? "Adding..." : "Add to Cart"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!product.inStock || isBusy}
          className="flex h-[60px] w-full items-center justify-center rounded-2xl bg-[#185b50] px-[30px] text-lg text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checkout.isPending ? "Redirecting..." : "Buy Now"}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-10">
        {productDetailTrustItems.map((item) => {
          const Icon = trustIcons[item.id];
          return (
            <div
              key={item.id}
              className="flex flex-col items-center gap-5 text-center"
            >
              <Icon className="size-[30px] text-[#185b50]" strokeWidth={1.5} />
              <p className="text-base font-semibold text-[#185b50]">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex w-full flex-col gap-5">
        {accordionItems.map((item) => {
          const isOpen = openAccordion === item.id;
          return (
            <div key={item.id} className="flex flex-col gap-5">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenAccordion((current) =>
                    current === item.id ? null : item.id,
                  )
                }
              >
                <span className="font-display text-2xl text-[#185b50]">
                  {item.title}
                </span>
                <ChevronDown
                  className={cn(
                    "size-6 shrink-0 text-[#185b50] transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen ? (
                <p className="text-base leading-normal text-[#185b50]/80">
                  {product.detail[item.contentKey] || "Details coming soon."}
                </p>
              ) : null}
              <div className="h-px w-full rounded-md bg-[#d9d9d9]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
