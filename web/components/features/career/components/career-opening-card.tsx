import { Banknote, Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import { buttonVariants } from "@/components/ui/button";

type CareerOpeningCardProps = {
  title: string;
  employmentType: string;
  description: string;
  location: string;
  salary: string;
  applyHref?: string;
};

export function CareerOpeningCard({
  title,
  employmentType,
  description,
  location,
  salary,
  applyHref = siteNavigation.comingSoon,
}: CareerOpeningCardProps) {
  return (
    <article className="flex h-full flex-col justify-between gap-5 rounded-[20px] bg-[#edffe3] p-[30px]">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-2.5">
          <div className="flex flex-1 flex-col gap-4">
            <h3 className="font-display text-[28px] leading-none text-[#023a40]">
              {title}
            </h3>
            <p className="text-lg leading-normal text-[#222]">
              {employmentType}
            </p>
          </div>

          <Link
            href={applyHref}
            className={buttonVariants({
              className:
                "h-[51px] w-[160px] shrink-0 rounded-2xl bg-[#023a40] px-[30px] text-base font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90",
            })}
          >
            Apply Now
          </Link>
        </div>

        <div className="h-px w-full rounded-sm bg-[#023a40]" aria-hidden />

        <p className="text-base leading-[1.5] text-[#222]">{description}</p>
      </div>

      <div className="flex flex-wrap items-start gap-x-5 gap-y-2 text-base text-[#222]">
        <div className="flex items-center gap-1.5">
          <MapPin
            className="size-5 shrink-0 text-[#023a40]"
            strokeWidth={1.5}
            aria-hidden
          />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock
            className="size-5 shrink-0 text-[#023a40]"
            strokeWidth={1.5}
            aria-hidden
          />
          <span>{employmentType}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Banknote
            className="size-5 shrink-0 text-[#023a40]"
            strokeWidth={1.5}
            aria-hidden
          />
          <span>{salary}</span>
        </div>
      </div>
    </article>
  );
}
