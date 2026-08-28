import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useNestTrpc } from "../../../api/trpc";
import type { ShopCategory, ShopProduct } from "../types";

const SHOP_STALE_TIME = 60_000;

type Facets = {
  categories?: ShopCategory[];
};

export function useShopCatalog() {
  const trpc = useNestTrpc();
  const [categoryId, setCategoryId] = useState<string | undefined>();

  const facets = useQuery(trpc.products.publicFacets.queryOptions(undefined, { staleTime: SHOP_STALE_TIME }));

  const list = useQuery(
    trpc.products.publicList.queryOptions(
      {
        page: 1,
        limit: 50,
        categoryId,
        sortBy: "name",
        sortOrder: "asc",
      },
      { staleTime: SHOP_STALE_TIME },
    ),
  );

  const facetCategories = (facets.data as Facets | undefined)?.categories ?? [];
  const fromProducts: ShopCategory[] = [];
  const seen = new Set<string>();
  for (const item of list.data?.items ?? []) {
    if (!item.category || seen.has(item.category.id)) continue;
    seen.add(item.category.id);
    fromProducts.push({ id: item.category.id, name: item.category.name, slug: item.category.slug });
  }
  const categories = facetCategories.length > 0 ? facetCategories : fromProducts;

  return {
    products: (list.data?.items ?? []) as ShopProduct[],
    categories,
    categoryId,
    setCategoryId,
    isPending: list.isPending,
    isError: list.isError,
    refetch: () => {
      void facets.refetch();
      void list.refetch();
    },
  };
}

export function useShopProduct(slug: string | undefined) {
  const trpc = useNestTrpc();

  return useQuery(
    trpc.products.publicGetBySlug.queryOptions(
      { slug: slug ?? "" },
      { staleTime: SHOP_STALE_TIME, enabled: Boolean(slug) },
    ),
  );
}
