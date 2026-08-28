import Link from "next/link";

import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { HomePageV2HeroVideo } from "@/components/features/home-page-v2/components/home-page-v2-hero-video";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2HeroSectionProps = {
  className?: string;
};

export function HomePageV2HeroSection({ className }: HomePageV2HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-svh w-full flex-col justify-end overflow-hidden pt-[76px] lg:pt-[120px]",
        className,
      )}
    >
      <HomePageV2HeroVideo />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(12,31,19,0.4)] via-[rgba(12,31,19,0.3)] to-[#faf7ee]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_115%_50%_at_50%_30%,rgba(12,31,19,0)_0%,rgba(12,31,19,0.45)_100%)]"
        aria-hidden
      />

      <HomePageV2ScrollHeader />

      <div className="relative z-10 w-full px-6 pt-10 pb-16 lg:px-[200px] lg:pt-24 lg:pb-32">
        <div className="flex max-w-3xl flex-col gap-6 lg:gap-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-[17px] py-[7px] backdrop-blur-[4px]">
            <span
              className="size-1.5 shrink-0 rounded-full bg-[#bf913d]"
              aria-hidden
            />
            <span className="text-sm tracking-[2px] text-white/85 uppercase">
              The Architecture of Longevity
            </span>
          </div>

          <h1 className="font-display text-4xl leading-[1.2] tracking-[-1.2px] text-white sm:text-5xl lg:text-[72px]">
            Where Eastern wisdom meets Western science.
          </h1>

          <p className="max-w-xl text-lg leading-7 text-white/85">
            A modern wellness sanctuary blending advanced science with
            intentional, personalized care — designed entirely around you.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={siteNavigation.book}
              className="inline-flex h-[57px] items-center rounded-full bg-[#faf7ee] px-7 text-base font-medium text-[#0c1f13] transition-colors hover:bg-[#faf7ee]/90"
            >
              Begin Your Journey
            </Link>
            <Link
              href={siteNavigation.comingSoon}
              className="inline-flex h-[57px] items-center rounded-full border border-white/30 px-7 text-base font-medium text-white transition-colors hover:bg-white/10"
            >
              Explore The Model
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
