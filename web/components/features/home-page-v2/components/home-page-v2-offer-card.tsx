import Image from "next/image";
import Link from "next/link";

import type { HomePageV2OfferCard } from "@/components/features/home-page-v2/home-page-v2-offers-data";
import { cn } from "@/lib/utils";

type HomePageV2OfferCardItemProps = {
  card: HomePageV2OfferCard;
  className?: string;
};

export function HomePageV2OfferCardItem({
  card,
  className,
}: HomePageV2OfferCardItemProps) {
  return (
    <article
      className={cn(
        "grid min-h-[360px] grid-cols-1 gap-6 overflow-hidden rounded-[28px] p-8 sm:grid-cols-2 sm:gap-6 sm:p-12 lg:min-h-[384px] lg:gap-6",
        card.backgroundClassName,
        className,
      )}
    >
      <div className="flex flex-col justify-end gap-2 self-end">
        <h3 className="font-display text-5xl text-[#0c1f13] lg:text-[60px]">
          {card.headline}
        </h3>
        <p className="font-display text-xl text-[#0c1f13] lg:text-2xl">
          {card.title}
        </p>
        <p className="max-w-[320px] pt-2 pb-4 text-base leading-[1.3] text-[rgba(12,31,19,0.7)]">
          {card.description}
        </p>
        <Link
          href={card.ctaHref}
          className="inline-flex w-fit items-center justify-center rounded-full bg-[#0c1f13] px-6 py-3 text-base font-medium text-[#faf7ee] transition-colors hover:bg-[#0c1f13]/90"
        >
          {card.ctaLabel}
        </Link>
      </div>

      <div className="relative h-[220px] w-full self-end overflow-hidden rounded-[24px] sm:h-[240px] lg:h-[288px]">
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          className={cn("object-cover", card.imageClassName)}
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
    </article>
  );
}
