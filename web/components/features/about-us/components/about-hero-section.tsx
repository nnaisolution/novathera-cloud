import Image from "next/image";

import { aboutUsAssets } from "@/components/features/about-us/assets";
import { aboutHeroCopy } from "@/components/features/about-us/about-us-data";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { cn } from "@/lib/utils";

type AboutHeroSectionProps = {
  className?: string;
};

export function AboutHeroSection({ className }: AboutHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[884px] w-full items-end overflow-hidden",
        className,
      )}
    >
      <Image
        src={aboutUsAssets.heroBackground}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#faf7ee] via-[rgba(250,247,238,0.5)] to-transparent"
        aria-hidden
      />

      <HomePageV2ScrollHeader overlayVariant="sticky" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-20 pt-32 lg:px-10 lg:pb-20">
        <div className="flex max-w-[576px] flex-col gap-6">
          <p className="text-base tracking-[0.8px] text-black uppercase">
            {aboutHeroCopy.eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-tight text-[#0c1f13] sm:text-5xl lg:text-[72px] lg:leading-none">
            {aboutHeroCopy.headlineBefore}
            <span className="text-[#d79628]">{aboutHeroCopy.headlineAccent}</span>
          </h1>
          <p className="max-w-[504px] text-lg leading-[1.5] text-[#546256]">
            {aboutHeroCopy.body}
          </p>
        </div>
      </div>
    </section>
  );
}
