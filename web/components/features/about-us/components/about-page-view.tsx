import { AboutCtaSection } from "@/components/features/about-us/components/about-cta-section";
import { AboutHeroSection } from "@/components/features/about-us/components/about-hero-section";
import { AboutPrinciplesSection } from "@/components/features/about-us/components/about-principles-section";
import { AboutStatsSection } from "@/components/features/about-us/components/about-stats-section";
import { AboutStorySection } from "@/components/features/about-us/components/about-story-section";
import { AboutTeamSection } from "@/components/features/about-us/components/about-team-section";
import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2InstagramSection } from "@/components/features/home-page-v2/components/home-page-v2-instagram-section";

export function AboutPageView() {
  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <AboutHeroSection />
        <AboutStorySection />
        <AboutPrinciplesSection />
        <AboutStatsSection />
        <AboutTeamSection />
        <HomePageV2InstagramSection className="bg-[#faf7ee]" />
        <AboutCtaSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
