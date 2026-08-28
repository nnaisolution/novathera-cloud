/** Shared routes and landing-page section anchors for header/footer nav. */
export const siteNavigation = {
  home: "/",
  aboutUs: "/about-us",
  services: "/services",
  solutions: "/#solutions",
  comingSoon: "/coming-soon",
  waitlist: "/coming-soon",
  book: "/book",
  bookConsultation: "/book",
  contact: "/contact-us",
  shop: "/shop",
  career: "/career",
  privacyPolicy: "/coming-soon",
  terms: "/coming-soon",
} as const;

export const headerNavItems = [
  { label: "Shop", hasDropdown: true, href: siteNavigation.shop },
  { label: "Services", hasDropdown: true, href: siteNavigation.services },
  { label: "Solutions", hasDropdown: true, href: siteNavigation.solutions },
  { label: "About", href: siteNavigation.aboutUs },
  // { label: "Blog", href: siteNavigation.blog },
  { label: "Career", href: siteNavigation.career },
  { label: "Contact", href: siteNavigation.contact },
] as const;

export const footerNavItems = [
  { label: "Home", href: siteNavigation.home },
  { label: "Services", href: siteNavigation.services },
  { label: "Solutions", href: siteNavigation.solutions },
  { label: "Career", href: siteNavigation.career },
  { label: "About Us", href: siteNavigation.aboutUs },
  { label: "Contact Us", href: siteNavigation.contact },
] as const;
