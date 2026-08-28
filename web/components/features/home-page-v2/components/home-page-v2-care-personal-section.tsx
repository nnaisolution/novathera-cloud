import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { homePageV2CarePersonalItems } from "@/components/features/home-page-v2/home-page-v2-care-personal-data";
import { cn } from "@/lib/utils";

type HomePageV2CarePersonalSectionProps = {
  className?: string;
};

export function HomePageV2CarePersonalSection({
  className,
}: HomePageV2CarePersonalSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 py-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-10">
        <div className="relative h-[360px] w-full overflow-hidden rounded-[30px] sm:h-[480px] lg:h-[571px] lg:max-w-[620px]">
          <Image
            src={homePageV2Assets.carePersonal.specialistConsultation}
            alt="Specialist consultation"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 620px"
          />
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex flex-col gap-4">
            <p className="text-sm tracking-[2px] text-[#546256] uppercase">
              Care, made personal
            </p>
            <h2 className="font-display text-4xl leading-[1.2] text-[#0c1f13] sm:text-5xl lg:text-[60px]">
              <span className="block">A protocol designed</span>
              <span className="block">
                entirely around{" "}
                <span className="italic text-[#bf913d]">you.</span>
              </span>
            </h2>
          </div>

          <p className="mt-6 max-w-[512px] text-lg leading-normal text-[#546256]">
            Every Nova Thera member receives a dedicated specialist, an evolving
            care plan, and 24/7 access to their team.
          </p>

          <ul className="mt-10 w-full border-y border-[#d8d8cd]">
            {homePageV2CarePersonalItems.map((item, index) => (
              <li
                key={item.id}
                className={cn(
                  index < homePageV2CarePersonalItems.length - 1 &&
                    "border-b border-[#d8d8cd]",
                )}
              >
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-4 py-5 transition-opacity hover:opacity-70"
                >
                  <span className="font-display text-xl text-[#0c1f13] sm:text-2xl">
                    {item.label}
                  </span>
                  <ArrowRight
                    className="size-5 shrink-0 text-[#546256]"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
