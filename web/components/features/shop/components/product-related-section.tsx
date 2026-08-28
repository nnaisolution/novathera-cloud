"use client";

import { ProductCard } from "@/components/features/shop/components/product-card";
import { useRelatedShopProducts } from "@/components/features/shop/hooks/use-shop-products";
import { shopRelatedCopy } from "@/components/features/shop/shop-data";
import { cn } from "@/lib/utils";

type ProductRelatedSectionProps = {
  slug: string;
  className?: string;
};

export function ProductRelatedSection({
  slug,
  className,
}: ProductRelatedSectionProps) {
  const relatedQuery = useRelatedShopProducts(slug, 4);
  const related = relatedQuery.data ?? [];

  if (relatedQuery.isLoading) {
    return (
      <section
        className={cn(
          "bg-[#faf7ee] px-6 py-16 lg:px-20 lg:pt-[100px] lg:pb-[100px]",
          className,
        )}
      >
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-12">
          <h2 className="font-display text-center text-4xl text-[#185b50] lg:text-[48px]">
            {shopRelatedCopy.title}
          </h2>
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[385/491] animate-pulse rounded-[20px] bg-[#edffe3]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (related.length === 0) return null;

  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 py-16 lg:px-20 lg:pt-[100px] lg:pb-[100px]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-12 lg:gap-14">
        <h2 className="font-display text-center text-4xl text-[#185b50] lg:text-[48px]">
          {shopRelatedCopy.title}
        </h2>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {related.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
