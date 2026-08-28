"use client";

import { useQuery } from "@tanstack/react-query";

import { mapPublicProduct } from "@/components/features/shop/utils/map-public-product";
import type { ShopActiveFilters } from "@/components/features/shop/shop-data";
import { useNestTrpc } from "@/lib/trpc/nest-client";

export function useShopProducts(filters: ShopActiveFilters) {
  const trpc = useNestTrpc();
  const facetsQuery = useShopFacets();

  // The filter panel works in labels; the backend filters on brand ids.
  const brandIds = filters.brand?.length
    ? (facetsQuery.data?.brands ?? [])
        .filter((brand) => filters.brand?.includes(brand.name))
        .map((brand) => brand.id)
    : undefined;

  return useQuery({
    ...trpc.products.publicList.queryOptions({
      page: 1,
      limit: 48,
      sortBy: "createdAt",
      brandIds: brandIds?.length ? brandIds : undefined,
      concerns: filters.areaOfConcern?.length
        ? filters.areaOfConcern
        : undefined,
      productTypes: filters.productType?.length
        ? filters.productType
        : undefined,
      ingredientsFacet: filters.ingredients?.length
        ? filters.ingredients
        : undefined,
      skinTypes: filters.skinType?.length ? filters.skinType : undefined,
    }),
    select: (data) => ({
      ...data,
      items: data.items.map(mapPublicProduct),
    }),
  });
}

export function useShopFacets() {
  const trpc = useNestTrpc();

  return useQuery(trpc.products.publicFacets.queryOptions());
}

export function useShopProduct(slug: string) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.products.publicGetBySlug.queryOptions({ slug }),
    enabled: Boolean(slug),
    select: mapPublicProduct,
  });
}

export function useRelatedShopProducts(excludeSlug: string, limit = 4) {
  const trpc = useNestTrpc();

  return useQuery({
    ...trpc.products.publicList.queryOptions({
      page: 1,
      limit: limit + 4,
      sortBy: "createdAt",
    }),
    select: (data) =>
      data.items
        .filter((product) => product.slug !== excludeSlug)
        .slice(0, limit)
        .map(mapPublicProduct),
  });
}
