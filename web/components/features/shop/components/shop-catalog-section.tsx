"use client";

import { useState } from "react";

import { ProductCard } from "@/components/features/shop/components/product-card";
import { ShopFilterPanel } from "@/components/features/shop/components/shop-filter-panel";
import {
  useShopFacets,
  useShopProducts,
} from "@/components/features/shop/hooks/use-shop-products";
import {
  shopCatalogCopy,
  shopFilterGroupMeta,
  type ShopActiveFilters,
} from "@/components/features/shop/shop-data";
import type { ShopFilterGroup } from "@/components/features/shop/types";
import { cn } from "@/lib/utils";

type ShopCatalogSectionProps = {
  className?: string;
};

/** Brand is excluded — its options come from objects, not a string list. */
const FACET_KEY_BY_GROUP_ID: Record<
  Exclude<ShopFilterGroup["id"], "brand">,
  "concerns" | "productTypes" | "ingredientsFacet" | "skinTypes"
> = {
  areaOfConcern: "concerns",
  productType: "productTypes",
  ingredients: "ingredientsFacet",
  skinType: "skinTypes",
};

export function ShopCatalogSection({ className }: ShopCatalogSectionProps) {
  const [activeFilters, setActiveFilters] = useState<ShopActiveFilters>({});
  const productsQuery = useShopProducts(activeFilters);
  const facetsQuery = useShopFacets();
  const products = productsQuery.data?.items ?? [];

  const filterGroups: ShopFilterGroup[] = shopFilterGroupMeta
    .map((meta) => ({
      ...meta,
      options:
        meta.id === "brand"
          ? ((facetsQuery.data?.brands ?? []).map(
              (brand) => brand.name,
            ) as string[])
          : (facetsQuery.data?.[FACET_KEY_BY_GROUP_ID[meta.id]] ?? []),
    }))
    // A single-brand catalogue does not need a brand filter.
    .filter((group) =>
      group.id === "brand" ? group.options.length > 1 : group.options.length > 0,
    );

  return (
    <section
      id="shop-catalog"
      className={cn(
        "bg-[#faf7ee] px-6 pt-16 pb-24 lg:px-20 lg:pt-20 lg:pb-40",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-10">
        <div className="flex max-w-[457px] flex-col items-center gap-2.5 text-center">
          <h2 className="font-display text-4xl text-nowrap text-[#185b50] lg:text-[48px]">
            {shopCatalogCopy.title}
          </h2>
          <p className="text-base leading-normal text-[#222]">
            {shopCatalogCopy.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
          {facetsQuery.isLoading ? (
            <div className="flex w-full max-w-[300px] shrink-0 flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 w-full animate-pulse rounded bg-[#edffe3]"
                />
              ))}
            </div>
          ) : (
            <ShopFilterPanel
              groups={filterGroups}
              activeFilters={activeFilters}
              onChange={setActiveFilters}
              className="shrink-0 lg:sticky lg:top-28"
            />
          )}

          {productsQuery.isLoading ? (
            <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[385/491] animate-pulse rounded-[20px] bg-[#edffe3]"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {!productsQuery.isLoading && products.length === 0 ? (
          <p className="text-base text-[#546256]">
            No products match the selected filters.
          </p>
        ) : null}

        {productsQuery.isError ? (
          <p className="text-base text-[#546256]">
            Unable to load products. Please try again shortly.
          </p>
        ) : null}
      </div>
    </section>
  );
}
