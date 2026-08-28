import { siteNavigation } from "@/components/shared/site-navigation";

export type HomePageV2CarePersonalItem = {
  id: string;
  label: string;
  href: string;
};

export const homePageV2CarePersonalItems: HomePageV2CarePersonalItem[] = [
  {
    id: "weight-management",
    label: "Personalized Weight Management",
    href: siteNavigation.comingSoon,
  },
  {
    id: "rejuvenate-skin",
    label: "Rejuvenate your skin",
    href: siteNavigation.comingSoon,
  },
  {
    id: "expert-products",
    label: "Expert-recommended Products",
    href: siteNavigation.comingSoon,
  },
  {
    id: "specialist-guidance",
    label: "1:1 Specialist Guidance",
    href: siteNavigation.comingSoon,
  },
];
