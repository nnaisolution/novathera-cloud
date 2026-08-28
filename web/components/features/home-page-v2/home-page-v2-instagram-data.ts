import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { siteNavigation } from "@/components/shared/site-navigation";

export type HomePageV2InstagramImage = {
  id: string;
  src: string;
  alt: string;
};

export const homePageV2InstagramImages: HomePageV2InstagramImage[] = [
  {
    id: "facial-treatment",
    src: homePageV2Assets.instagram.facialTreatment,
    alt: "Facial treatment at Nova Thera",
  },
  {
    id: "skin-portrait",
    src: homePageV2Assets.instagram.skinPortrait,
    alt: "Skincare portrait",
  },
  {
    id: "clinical-procedure",
    src: homePageV2Assets.instagram.clinicalProcedure,
    alt: "Clinical skincare procedure",
  },
  {
    id: "hair-wash",
    src: homePageV2Assets.instagram.hairWash,
    alt: "Hair wellness treatment",
  },
  {
    id: "wellness-leaf",
    src: homePageV2Assets.instagram.wellnessLeaf,
    alt: "Natural wellness ritual",
  },
  {
    id: "park-wellness",
    src: homePageV2Assets.instagram.parkWellness,
    alt: "Outdoor wellness moment",
  },
];

export const homePageV2InstagramCta = {
  label: "Follow us on Instagram",
  href: siteNavigation.comingSoon,
} as const;
