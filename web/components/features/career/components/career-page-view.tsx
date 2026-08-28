import { CareerCurrentOpportunitiesSection } from "@/components/features/career/components/career-current-opportunities-section";
import { CareerHeroSection } from "@/components/features/career/components/career-hero-section";
import { CareerWhyJoinSection } from "@/components/features/career/components/career-why-join-section";
import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";

export function CareerPageView() {
  return (
    <>
      <main className="flex flex-col">
        <CareerHeroSection />
        <CareerWhyJoinSection />
        <CareerCurrentOpportunitiesSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
