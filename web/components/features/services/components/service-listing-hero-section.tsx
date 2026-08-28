import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";

export function ServiceListingHeroSection() {
  return (
    <section className="relative flex min-h-[420px] w-full items-center overflow-hidden bg-[#185b50]">
      <HomePageV2ScrollHeader overlayVariant="sticky" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pt-28 pb-16 lg:px-10 lg:pt-0 lg:pb-0">
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-[64px]">
          Our Services
        </h1>
        <p className="mt-4 max-w-[560px] text-lg text-white/80">
          Advanced aesthetics, recovery therapies, and holistic wellness
          treatments guided by certified practitioners.
        </p>
      </div>
    </section>
  );
}
