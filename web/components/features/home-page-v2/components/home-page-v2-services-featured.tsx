import Image from "next/image";
import Link from "next/link";

import { homePageV2FeaturedService } from "@/components/features/home-page-v2/home-page-v2-services-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2ServicesFeaturedProps = {
  className?: string;
};

export function HomePageV2ServicesFeatured({
  className,
}: HomePageV2ServicesFeaturedProps) {
  const featured = homePageV2FeaturedService;

  return (
    <Link
      href={siteNavigation.services}
      className={cn(
        "relative flex min-h-[400px] flex-1 overflow-hidden rounded-[28px] lg:min-h-[584px]",
        className,
      )}
    >
      <Image
        src={featured.image}
        alt={featured.title}
        fill
        className="object-cover object-center"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[rgba(12,31,19,0.7)] via-[rgba(12,31,19,0.1)] to-transparent"
        aria-hidden
      />
      <div className="absolute inset-x-8 bottom-8 flex flex-col gap-2">
        <p className="text-sm tracking-[2px] text-white/80 uppercase">
          {featured.category}
        </p>
        <h3 className="font-display text-3xl text-white lg:text-[40px]">
          {featured.title}
        </h3>
        <p className="max-w-md text-base text-white/85">{featured.description}</p>
      </div>
    </Link>
  );
}
