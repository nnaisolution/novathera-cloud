import type { PublicProduct } from "@/types/trpc/ecommerce";

import type { Product, ProductFacets } from "@/components/features/shop/types";

export function mapPublicProduct(product: PublicProduct): Product {
  const facets: ProductFacets = {
    areaOfConcern: product.concerns,
    productType: product.productTypes,
    ingredients: product.ingredientsFacet,
    skinType: product.skinTypes,
  };

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? "",
    priceCents: product.priceCents,
    currency: product.currency,
    categoryId: product.categoryId ?? "",
    categoryLabel: product.category?.name ?? "Skincare",
    brandId: product.brandId,
    brandName: product.brand?.name ?? "",
    breadcrumbCategory: product.category?.name ?? "Shop",
    images: product.images.map((image) => ({
      src: image.url,
      alt: image.alt ?? product.name,
    })),
    facets,
    detail: {
      information: product.description ?? "",
      keyIngredients: product.ingredients ?? "",
      howToUse: product.howToUse ?? "",
    },
    inStock: product.stockAvailable,
  };
}

export function formatProductPrice(priceCents: number, currency = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}
