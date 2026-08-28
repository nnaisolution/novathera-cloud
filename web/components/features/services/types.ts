export type ServiceDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  imageUrl: string | null;
  tags: string[];
  durationMinutes: number;
  standardPriceCents: number;
  memberPriceCents: number | null;
  currency: string;
  clientCanChooseStaff: boolean;
  category: { id: string; name: string } | null;
};

export type ServiceSummary = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  imageUrl: string | null;
  durationMinutes: number;
  standardPriceCents: number;
  currency: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
};

export type ServiceCategorySummary = {
  id: string;
  name: string;
  iconUrl: string | null;
};

export type ServiceFilterFacetId = "categoryId" | "tags";

export type ServiceFilterGroup = {
  id: ServiceFilterFacetId;
  label: string;
  options: { value: string; label: string }[];
};

export type ServiceActiveFilters = Partial<
  Record<ServiceFilterFacetId, string[]>
>;
