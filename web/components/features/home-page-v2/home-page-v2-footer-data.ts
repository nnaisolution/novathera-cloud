import { siteNavigation } from "@/components/shared/site-navigation";

export const homePageV2FooterExploreLinks = [
  { label: "Services", href: siteNavigation.services },
  { label: "Solutions", href: siteNavigation.solutions },
  { label: "Products", href: siteNavigation.shop },
  { label: "Journal", href: siteNavigation.comingSoon },
  { label: "About Us", href: siteNavigation.aboutUs },
  { label: "Contact Us", href: siteNavigation.contact },
  { label: "Careers", href: siteNavigation.career },
] as const;

export const homePageV2FooterContactItems = [
  {
    label: "marketing@novathera.ca",
    href: "mailto:marketing@novathera.ca",
  },
  {
    label: "Unit 2 156 Chrislea Rd, Woodbridge, ON L4L 8V1",
    href: "https://maps.google.com/?q=Unit+2+156+Chrislea+Rd,+Woodbridge,+ON+L4L+8V1",
  },
] as const;

export const homePageV2FooterLegalLinks = [
  { label: "Privacy", href: siteNavigation.privacyPolicy },
  { label: "Terms", href: siteNavigation.terms },
] as const;
