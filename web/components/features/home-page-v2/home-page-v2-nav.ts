import { siteNavigation } from "@/components/shared/site-navigation";

export const homePageV2NavItems = [
  { label: "Home", href: siteNavigation.home },
  { label: "Our Approach", href: siteNavigation.comingSoon },
  { label: "Services", href: siteNavigation.services },
  { label: "Diagnostics", href: siteNavigation.comingSoon },
  { label: "Learn & Train", href: siteNavigation.comingSoon },
  { label: "Memberships", href: siteNavigation.comingSoon },
  { label: "Shop", href: siteNavigation.shop },
] as const;
