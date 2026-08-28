import Link from "next/link";

import { HomePageV2InstagramCarousel } from "@/components/features/home-page-v2/components/home-page-v2-instagram-carousel";
import { homePageV2InstagramCta } from "@/components/features/home-page-v2/home-page-v2-instagram-data";
import { cn } from "@/lib/utils";

type HomePageV2InstagramSectionProps = {
  className?: string;
};

export function HomePageV2InstagramSection({
  className,
}: HomePageV2InstagramSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-10 bg-white px-6 pt-[60px] pb-[120px] lg:px-40",
        className,
      )}
    >
      <div className="flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="font-display text-4xl text-[#0c1f13] sm:text-5xl lg:text-[60px]">
          @novathera
        </h2>
        <p className="text-lg text-[#546256]">
          Follow our journey for skincare tips, wellness insights, treatment
          results, and exclusive updates.
        </p>
      </div>

      <HomePageV2InstagramCarousel />

      <Link
        href={homePageV2InstagramCta.href}
        className="inline-flex items-center justify-center rounded-full bg-[#185b50] px-7 py-3.5 text-base font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
      >
        {homePageV2InstagramCta.label}
      </Link>
    </section>
  );
}
