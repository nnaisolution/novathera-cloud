import Image from "next/image";

import type { HomePageV2SolveCard } from "@/components/features/home-page-v2/home-page-v2-solve-data";
import { cn } from "@/lib/utils";

type HomePageV2SolveCardProps = {
  card: HomePageV2SolveCard;
  className?: string;
};

export function HomePageV2SolveCardItem({
  card,
  className,
}: HomePageV2SolveCardProps) {
  return (
    <article
      className={cn(
        "relative flex flex-col rounded-[28px] border border-[rgba(28,58,39,0.3)] bg-[#faf7ee] p-[25px]",
        className,
      )}
    >
      <div className="flex flex-col gap-5">
        <p className="text-[14px] text-[#546256] uppercase">{card.category}</p>

        <div className="relative h-[219px] w-full overflow-hidden rounded-[14px] bg-white">
          <Image
            src={card.image}
            alt={card.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 413px"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-display text-[24px] text-[#0c1f13]">{card.title}</h3>
          <p className="text-[14px] leading-5 text-[#546256]">{card.description}</p>
        </div>
      </div>
    </article>
  );
}
