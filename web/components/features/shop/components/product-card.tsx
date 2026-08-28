"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { shopAssets } from "@/components/features/shop/assets";
import { useCartActions } from "@/components/features/shop/hooks/use-cart";
import { formatProductPrice } from "@/components/features/shop/shop-data";
import type { Product } from "@/components/features/shop/types";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const { addItem } = useCartActions();
  const image = product.images[0];

  async function handleAddToCart(
    event: React.MouseEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!session?.user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    await addItem.mutateAsync({ productId: product.id, quantity: 1 });
  }

  return (
    <article
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[20px] bg-[#edffe3]",
        className,
      )}
    >
      <div className="relative aspect-[385/491] w-full overflow-hidden rounded-[10px] bg-white">
        <Link
          href={shopRoutes.product(product.slug)}
          className="absolute inset-0"
          aria-label={`View ${product.name}`}
        >
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              unoptimized={image.src.startsWith("http")}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 385px"
            />
          ) : null}
        </Link>

        <span className="pointer-events-none absolute top-5 left-5 z-10 flex h-10 items-center rounded-[40px] bg-white px-5 text-base text-[#185b50]">
          {product.brandName || product.categoryLabel}
        </span>

        <button
          type="button"
          aria-label={`Add ${product.name} to cart`}
          disabled={addItem.isPending || !product.inStock}
          onClick={handleAddToCart}
          className="absolute top-5 right-5 z-10 flex size-10 items-center justify-center rounded-full bg-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          <Image
            src={shopAssets.icons.bag}
            alt=""
            width={20}
            height={20}
            unoptimized
            className="size-5"
          />
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end gap-2.5 px-5 pb-5 text-xl uppercase text-[#185b50]">
          <p className="min-w-0 flex-1 truncate">{product.name}</p>
          <p className="shrink-0 whitespace-nowrap">
            {formatProductPrice(product.priceCents, product.currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
