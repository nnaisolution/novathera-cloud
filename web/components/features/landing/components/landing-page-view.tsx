// import { BlogSection } from "@/components/features/landing/components/blog-section";
import { BrandSection } from "@/components/features/landing/components/brand-section";
import { EssentialsSection } from "@/components/features/landing/components/essentials-section";
import { FooterSection } from "@/components/features/landing/components/footer-section";
import { HeroSection } from "@/components/features/landing/components/hero-section";
import { MembershipSection } from "@/components/features/landing/components/membership-section";
import { PromoGridSection } from "@/components/features/landing/components/promo-grid-section";
import { ServicesSection } from "@/components/features/landing/components/services-section";
import { TopSolutionsSection } from "@/components/features/landing/components/top-solutions-section";
import { WellnessJourneySection } from "@/components/features/landing/components/wellness-journey-section";

export function LandingPageView() {
  return (
    <main className="flex flex-col">
      <HeroSection />
      <WellnessJourneySection />
      <ServicesSection />
      <TopSolutionsSection />
      <EssentialsSection />
      <BrandSection />
      <MembershipSection />
      <PromoGridSection />
      {/* <BlogSection /> */}
      <FooterSection />
    </main>
  );
}
