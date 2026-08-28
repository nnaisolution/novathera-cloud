import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { HomePageV2ServiceCard } from "@/components/features/home-page-v2/home-page-v2-services-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2ServiceCardItemProps = {
  card: HomePageV2ServiceCard;
  className?: string;
};

export function HomePageV2ServiceCardItem({
  card,
  className,
}: HomePageV2ServiceCardItemProps) {
  return (
    <Link
      href={siteNavigation.comingSoon}
      className={cn(
        "relative flex flex-col rounded-[28px] p-[25px] transition-colors hover:bg-[#faf7ee]",
        card.featured
          ? "border border-[rgba(28,58,39,0.3)] bg-[#faf7ee] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]"
          : "border border-[#d8d8cd] bg-[rgba(250,247,238,0.5)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="text-sm text-[#546256] uppercase">{card.category}</p>
          <h3 className="font-display text-[22px] text-[#bf913d]">
            {card.title}
          </h3>
          <p className="text-sm leading-5 text-[#546256]">{card.description}</p>
        </div>
        <ArrowRight
          className="size-6 shrink-0 text-[#546256]"
          aria-hidden
        />
      </div>
    </Link>
  );
}
