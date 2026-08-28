/** Shared ecommerce domain types for the public shop UI. */

export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type ProductFacets = {
  areaOfConcern: string[];
  productType: string[];
  ingredients: string[];
  skinType: string[];
};

export type ProductDetailContent = {
  information: string;
  keyIngredients: string;
  howToUse: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Price in cents (CAD unless currency set). */
  priceCents: number;
  currency: string;
  categoryId: string;
  /** Chip label on the product card / PDP. */
  categoryLabel: string;
  /** Which business sells this product. */
  brandId: string;
  brandName: string;
  /** Breadcrumb middle segment (e.g. Best Sellers). */
  breadcrumbCategory: string;
  images: ProductImage[];
  facets: ProductFacets;
  detail: ProductDetailContent;
  inStock: boolean;
  featured?: boolean;
};

export type ShopFilterFacetId =
  | "brand"
  | "areaOfConcern"
  | "productType"
  | "ingredients"
  | "skinType";

export type ShopFilterGroup = {
  id: ShopFilterFacetId;
  label: string;
  options: string[];
};

export type CartLineItem = {
  productId: string;
  quantity: number;
};

export type ShopCart = {
  items: CartLineItem[];
};
