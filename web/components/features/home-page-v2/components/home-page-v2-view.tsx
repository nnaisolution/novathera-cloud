import { HomePageV2CarePersonalSection } from "@/components/features/home-page-v2/components/home-page-v2-care-personal-section";
import { HomePageV2ClientJourneySection } from "@/components/features/home-page-v2/components/home-page-v2-client-journey-section";
import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2HeroSection } from "@/components/features/home-page-v2/components/home-page-v2-hero-section";
import { HomePageV2InstagramSection } from "@/components/features/home-page-v2/components/home-page-v2-instagram-section";
import { HomePageV2OurApproachSection } from "@/components/features/home-page-v2/components/home-page-v2-our-approach-section";
import { HomePageV2OurServicesSection } from "@/components/features/home-page-v2/components/home-page-v2-our-services-section";
import { HomePageV2JournalSection } from "@/components/features/home-page-v2/components/home-page-v2-journal-section";
import { HomePageV2OffersSection } from "@/components/features/home-page-v2/components/home-page-v2-offers-section";
import { HomePageV2PlatformCtaSection } from "@/components/features/home-page-v2/components/home-page-v2-platform-cta-section";
import { HomePageV2TestimonialsSection } from "@/components/features/home-page-v2/components/home-page-v2-testimonials-section";
import { HomePageV2TextBarSection } from "@/components/features/home-page-v2/components/home-page-v2-text-bar-section";
import { HomePageV2WhatWeSolveSection } from "@/components/features/home-page-v2/components/home-page-v2-what-we-solve-section";

export function HomePageV2View() {
  return (
    <>
      <main className="flex flex-col">
        <HomePageV2HeroSection />
        <HomePageV2TextBarSection />
        <HomePageV2WhatWeSolveSection />
        <HomePageV2ClientJourneySection />
        <HomePageV2OurServicesSection />
        <HomePageV2OurApproachSection />
        <HomePageV2PlatformCtaSection />
        <HomePageV2OffersSection />
        <HomePageV2CarePersonalSection />
        <HomePageV2TestimonialsSection />
        <HomePageV2JournalSection />
        <HomePageV2InstagramSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
