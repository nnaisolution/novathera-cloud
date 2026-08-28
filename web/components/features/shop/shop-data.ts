import { shopAssets } from "@/components/features/shop/assets";
import type { ShopFilterGroup } from "@/components/features/shop/types";

export const shopHeroCopy = {
  line1: "Elevate Your",
  line2: "Everyday Routine",
} as const;

export const shopCatalogCopy = {
  title: "Shop Smart Skincare",
  description: "Smarter choices for skin that looks and feels its best.",
  filtersHeading: "Filters",
} as const;

export const shopVoicesBrandCopy = {
  headlineLine1: "Redefine the",
  headlineLine2: "Way You Feel",
  body: "Nova Thera is a modern wellness and aesthetic destination that blends advanced science with personalized care to deliver real, lasting results.",
  cta: "Shop Now",
  watermark: "Nova   Thera",
} as const;

export const productDetailTrustItems = [
  { id: "shipping", label: "Free Shipping" },
  { id: "return", label: "Easy Return" },
  { id: "checkout", label: "Safe Checkout" },
] as const;

export const shopRelatedCopy = {
  title: "Shop Related Products",
} as const;

/** Facet group labels — the option lists come from real product data (useShopFacets). */
export const shopFilterGroupMeta: Omit<ShopFilterGroup, "options">[] = [
  { id: "brand", label: "Brand" },
  { id: "areaOfConcern", label: "Area of Concern" },
  { id: "productType", label: "Product Type" },
  { id: "ingredients", label: "Ingredients" },
  { id: "skinType", label: "Skin Type" },
];

export type ShopActiveFilters = Partial<
  Record<ShopFilterGroup["id"], string[]>
>;

export { formatProductPrice } from "@/components/features/shop/utils/map-public-product";

/** Placeholder PDP gallery when a product has no images yet. */
export const shopFallbackGallery = [
  {
    src: shopAssets.pdp.serumHero,
    alt: "Nova Thera product",
  },
] as const;
