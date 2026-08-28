import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { ShopCatalogSection } from "@/components/features/shop/components/shop-catalog-section";
import { ShopHeroSection } from "@/components/features/shop/components/shop-hero-section";
import { ShopVoicesBrandSection } from "@/components/features/shop/components/shop-voices-brand-section";

export function ShopPageView() {
  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <ShopHeroSection />
        <ShopCatalogSection />
        <ShopVoicesBrandSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
