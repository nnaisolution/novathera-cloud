import Image from "next/image";
import Link from "next/link";

import { aboutUsAssets } from "@/components/features/about-us/assets";
import { aboutCtaCopy } from "@/components/features/about-us/about-us-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type AboutCtaSectionProps = {
  className?: string;
};

export function AboutCtaSection({ className }: AboutCtaSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 pt-8 pb-16 lg:px-[200px] lg:pb-24",
        className,
      )}
    >
      <div className="relative mx-auto w-full max-w-[1280px] overflow-hidden rounded-[28px] bg-[#185b50]">
        <Image
          src={aboutUsAssets.ctaBackground}
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />

        <div className="relative z-10 mx-auto flex max-w-[768px] flex-col items-center gap-6 px-8 py-20 text-center sm:px-16 sm:py-28">
          <h2 className="font-display text-4xl tracking-[-0.6px] text-[#f8f5ec] sm:text-[48px] sm:leading-[60px]">
            {aboutCtaCopy.headlineBefore}
            <span className="text-[#d79628]">{aboutCtaCopy.headlineAccent}</span>
          </h2>
          <p className="max-w-xl text-lg leading-7 text-[#f8f5ec]">
            {aboutCtaCopy.body}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={siteNavigation.book}
              className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(138deg,#f3b94c_0%,#e0991a_25%,#d68900_33%,#cb7a00_50%,#d68900_67%,#e0991a_75%,#f3b94c_100%)] px-8 py-3.5 text-base font-semibold text-[#1b0e04] shadow-[0px_10px_30px_-10px_rgba(215,150,40,0.55)] transition-opacity hover:opacity-90"
            >
              {aboutCtaCopy.primaryCta}
            </Link>
            <Link
              href={siteNavigation.services}
              className="inline-flex items-center justify-center rounded-full border border-[rgba(248,245,236,0.3)] px-8 py-3.5 text-base font-medium text-[#f8f5ec] transition-colors hover:bg-white/10"
            >
              {aboutCtaCopy.secondaryCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
