import Link from "next/link";

import { HomePageV2ClientJourneyStepCard } from "@/components/features/home-page-v2/components/home-page-v2-client-journey-step-card";
import { homePageV2ClientJourneySteps } from "@/components/features/home-page-v2/home-page-v2-client-journey-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2ClientJourneySectionProps = {
  className?: string;
};

export function HomePageV2ClientJourneySection({
  className,
}: HomePageV2ClientJourneySectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center gap-[60px] bg-[#faf7ee] px-6 pt-[50px] pb-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm tracking-[2px] text-[#bf913d] uppercase">
          The Client Journey
        </p>
        <h2 className="font-display text-4xl leading-[1.2] sm:text-5xl lg:text-[60px]">
          <span className="text-[#0c1f13]">From discovery to </span>
          <span className="text-[#bf913d]">lifelong thrive.</span>
        </h2>
      </div>

      <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-[28px] border border-[#d8d8cd] bg-[#d8d8cd] md:grid-cols-2 xl:grid-cols-4">
        {homePageV2ClientJourneySteps.map((step) => (
          <HomePageV2ClientJourneyStepCard key={step.id} step={step} />
        ))}
      </div>

      <Link
        href={siteNavigation.book}
        className="inline-flex items-center justify-center rounded-full bg-[#185b50] px-7 py-3.5 text-base font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
      >
        Start your journey
      </Link>
    </section>
  );
}
