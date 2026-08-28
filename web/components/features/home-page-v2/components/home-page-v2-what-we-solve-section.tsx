import Link from "next/link";

import { HomePageV2SolveCardItem } from "@/components/features/home-page-v2/components/home-page-v2-solve-card";
import { homePageV2SolveCards } from "@/components/features/home-page-v2/home-page-v2-solve-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2WhatWeSolveSectionProps = {
  className?: string;
};

export function HomePageV2WhatWeSolveSection({
  className,
}: HomePageV2WhatWeSolveSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-[60px] bg-[#faf7ee] px-6 pt-[100px] pb-[50px] lg:px-[200px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-[14px] tracking-[2px] text-[#bf913d] uppercase">
          what we solve
        </p>
        <h2 className="font-display text-4xl leading-[1.2] tracking-[-0.72px] sm:text-5xl lg:text-[60px]">
          <span className="block text-[#0c1f13]">Every pain point,</span>
          <span className="block text-[#bf913d]">under one roof.</span>
        </h2>
      </div>

      <div className="w-full rounded-[28px] border border-[#d8d8cd] p-px">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {homePageV2SolveCards.map((card) => (
            <HomePageV2SolveCardItem key={card.id} card={card} />
          ))}
        </div>
      </div>

      <Link
        href={siteNavigation.services}
        className="inline-flex items-center justify-center rounded-full bg-[#185b50] px-7 py-3.5 text-[16px] font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
      >
        Explore More
      </Link>
    </section>
  );
}
