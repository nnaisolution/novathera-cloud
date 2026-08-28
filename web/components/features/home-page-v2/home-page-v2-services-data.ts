import { homePageV2Assets } from "@/components/features/home-page-v2/assets";

export type HomePageV2ServiceCategoryId =
  | "all"
  | "regulated-msp"
  | "aesthetics"
  | "weight-body"
  | "diagnostics"
  | "biohacking"
  | "iv-therapy"
  | "mens-womens"
  | "mind-movement"
  | "beauty-salon";

export type HomePageV2ServiceCategory = {
  id: HomePageV2ServiceCategoryId;
  label: string;
};

export const homePageV2ServiceCategories: HomePageV2ServiceCategory[] = [
  { id: "all", label: "All" },
  { id: "regulated-msp", label: "Regulated / MSP" },
  { id: "aesthetics", label: "Aesthetics" },
  { id: "weight-body", label: "Weight & Body" },
  { id: "diagnostics", label: "Diagnostics" },
  { id: "biohacking", label: "Biohacking" },
  { id: "iv-therapy", label: "IV Therapy" },
  { id: "mens-womens", label: "Men's & Women's" },
  { id: "mind-movement", label: "Mind & Movement" },
  { id: "beauty-salon", label: "Beauty Salon" },
];

export type HomePageV2FeaturedService = {
  category: string;
  title: string;
  description: string;
  image: string;
};

export const homePageV2FeaturedService: HomePageV2FeaturedService = {
  category: "Skincare",
  title: "Bio-Therapeutic Facials",
  description:
    "Clinical-grade rituals tuned to your skin's unique biology.",
  image: homePageV2Assets.ourServices.featured,
};

export type HomePageV2ServiceCard = {
  id: string;
  category: string;
  categoryId: Exclude<HomePageV2ServiceCategoryId, "all">;
  title: string;
  description: string;
  featured?: boolean;
};

export const homePageV2ServiceCards: HomePageV2ServiceCard[] = [
  {
    id: "registered-massage-therapy",
    category: "regulated / msp",
    categoryId: "regulated-msp",
    title: "Registered Massage Therapy",
    description:
      "Lymphatic drainage, deep tissue, athletes recovery & pain control.",
    featured: true,
  },
  {
    id: "injectables",
    category: "Aesthetics",
    categoryId: "aesthetics",
    title: "Injectables — Botox, Fillers, PRP",
    description: "Physician-supervised facial rejuvenation & contouring.",
  },
  {
    id: "mental-health-consultations",
    category: "Mind & Movement",
    categoryId: "mind-movement",
    title: "Mental Health Consultations",
    description: "Cognitive-behavioral & mindfulness-integrated support.",
  },
  {
    id: "hair-styling-color",
    category: "Beauty Salon",
    categoryId: "beauty-salon",
    title: "Hair Styling & Color",
    description: "Full-service salon with head massage & foot reflexology.",
  },
];
