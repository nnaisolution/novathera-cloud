import { ContactChannelsSection } from "@/components/features/contact-us/components/contact-channels-section";
import { ContactConsultationSection } from "@/components/features/contact-us/components/contact-consultation-section";
import { ContactFaqSection } from "@/components/features/contact-us/components/contact-faq-section";
import { ContactHeroSection } from "@/components/features/contact-us/components/contact-hero-section";
import { ContactVisitCtaSection } from "@/components/features/contact-us/components/contact-visit-cta-section";
import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";

export function ContactPageView() {
  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <ContactHeroSection />
        <ContactChannelsSection />
        <ContactConsultationSection />
        <ContactFaqSection />
        <ContactVisitCtaSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
