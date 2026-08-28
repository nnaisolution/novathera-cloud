import Image from "next/image";

import { contactUsAssets } from "@/components/features/contact-us/assets";
import { contactHeroCopy } from "@/components/features/contact-us/contact-us-data";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { cn } from "@/lib/utils";

type ContactHeroSectionProps = {
  className?: string;
};

export function ContactHeroSection({ className }: ContactHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[700px] w-full items-end overflow-hidden lg:min-h-[884px]",
        className,
      )}
    >
      <Image
        src={contactUsAssets.heroBackground}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#faf7ee] via-[rgba(250,247,238,0.6)] to-transparent"
        aria-hidden
      />

      <HomePageV2ScrollHeader overlayVariant="sticky" />

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-16 pt-32 lg:px-10 lg:pb-20">
        <div className="flex max-w-[640px] flex-col gap-6">
          <p className="text-base tracking-[3px] text-[#d79628] uppercase">
            {contactHeroCopy.eyebrow}
          </p>
          <h1 className="font-display text-4xl leading-tight tracking-[-1px] text-[#0c1f13] sm:text-5xl lg:text-[72px] lg:leading-[1.05]">
            {contactHeroCopy.headlineBefore}
            <span className="text-[#d79628]">
              {contactHeroCopy.headlineAccent}
            </span>
            {contactHeroCopy.headlineAfter}
          </h1>
          <p className="max-w-[576px] text-lg leading-[1.5] text-[#546256]">
            {contactHeroCopy.body}
          </p>
        </div>
      </div>
    </section>
  );
}
