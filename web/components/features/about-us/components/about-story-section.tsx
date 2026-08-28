import Image from "next/image";

import { aboutUsAssets } from "@/components/features/about-us/assets";
import { aboutStoryCopy } from "@/components/features/about-us/about-us-data";
import { cn } from "@/lib/utils";

type AboutStorySectionProps = {
  className?: string;
};

export function AboutStorySection({ className }: AboutStorySectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 pt-8 pb-16 lg:px-[200px] lg:pt-8 lg:pb-24",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-1 gap-4">
          <div className="relative min-h-[280px] flex-1 overflow-hidden rounded-[28px] sm:min-h-[370px]">
            <Image
              src={aboutUsAssets.story.treatmentChair}
              alt="Practitioner assisting a patient in a treatment chair"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="relative mt-8 min-h-[280px] flex-1 overflow-hidden rounded-[28px] sm:mt-8 sm:min-h-[370px]">
            <Image
              src={aboutUsAssets.story.hairTreatment}
              alt="Practitioner performing a scalp treatment"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-6 lg:gap-[25.6px]">
          <p className="text-base tracking-[0.8px] text-[#d79628] uppercase">
            {aboutStoryCopy.eyebrow}
          </p>
          <h2 className="font-display text-3xl leading-[1.3] tracking-[-0.6px] text-[#0c1f13] sm:text-4xl lg:text-[48px]">
            {aboutStoryCopy.headline}
          </h2>
          <div className="flex flex-col gap-5 text-base leading-[1.5] text-[#546256]">
            {aboutStoryCopy.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-3.5">
            {aboutStoryCopy.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[rgba(215,150,40,0.4)] px-[17px] py-[7px] text-base text-[#d79628]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
