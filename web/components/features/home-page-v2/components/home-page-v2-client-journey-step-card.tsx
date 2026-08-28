import { ArrowRight } from "lucide-react";

import type { HomePageV2ClientJourneyStep } from "@/components/features/home-page-v2/home-page-v2-client-journey-data";
import { cn } from "@/lib/utils";

type HomePageV2ClientJourneyStepCardProps = {
  step: HomePageV2ClientJourneyStep;
  className?: string;
};

export function HomePageV2ClientJourneyStepCard({
  step,
  className,
}: HomePageV2ClientJourneyStepCardProps) {
  return (
    <article
      className={cn(
        "flex min-h-[280px] flex-col gap-6 bg-[#faf7ee] p-10",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-[30px] leading-9 tracking-[-0.3px] text-[#bf913d]">
          {step.number}
        </span>
        <span
          className="flex size-10 items-center justify-center rounded-full border border-[#d8d8cd] text-[rgba(12,31,19,0.6)]"
          aria-hidden
        >
          <ArrowRight className="size-4" />
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <h3 className="font-display text-2xl text-[#0c1f13]">{step.title}</h3>
        <p className="text-base leading-6 text-[#546256]">{step.description}</p>
      </div>
    </article>
  );
}
