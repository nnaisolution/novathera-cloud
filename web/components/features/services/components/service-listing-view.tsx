import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";

import { ServiceListingCatalogSection } from "./service-listing-catalog-section";
import { ServiceListingHeroSection } from "./service-listing-hero-section";

export function ServiceListingView() {
  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <ServiceListingHeroSection />
        <ServiceListingCatalogSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
