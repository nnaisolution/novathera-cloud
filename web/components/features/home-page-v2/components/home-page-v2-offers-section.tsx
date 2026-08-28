import { HomePageV2OfferCardItem } from "@/components/features/home-page-v2/components/home-page-v2-offer-card";
import { homePageV2OfferCards } from "@/components/features/home-page-v2/home-page-v2-offers-data";
import { cn } from "@/lib/utils";

type HomePageV2OffersSectionProps = {
  className?: string;
};

export function HomePageV2OffersSection({
  className,
}: HomePageV2OffersSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center px-6 pt-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-5 lg:grid-cols-2">
        {homePageV2OfferCards.map((card) => (
          <HomePageV2OfferCardItem key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
