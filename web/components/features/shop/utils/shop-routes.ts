export const shopRoutes = {
  root: "/shop",
  cart: "/shop/cart",
  checkoutSuccess: "/shop/checkout/success",
  product: (slug: string) => `/shop/${slug}`,
} as const;
