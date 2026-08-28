export const serviceRoutes = {
  root: "/services",
  detail: (slug: string) => `/services/${slug}`,
} as const;
