import Image from "next/image";

import { shopAssets } from "@/components/features/shop/assets";
import { shopHeroCopy } from "@/components/features/shop/shop-data";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { cn } from "@/lib/utils";

type ShopHeroSectionProps = {
  className?: string;
};

export function ShopHeroSection({ className }: ShopHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[480px] w-full items-center overflow-hidden lg:min-h-[800px]",
        className,
      )}
    >
      <Image
        src={shopAssets.heroBanner}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <HomePageV2ScrollHeader overlayVariant="sticky" />

      <div className="relative z-10 mx-auto w-full max-w-[1920px] px-6 pt-28 pb-16 lg:px-[87px] lg:pt-0 lg:pb-0">
        <h1 className="font-display max-w-[547px] text-4xl leading-tight text-[#185b50] sm:text-5xl lg:text-[72px] lg:leading-none">
          <span className="block">{shopHeroCopy.line1}</span>
          <span className="block">{shopHeroCopy.line2}</span>
        </h1>
      </div>
    </section>
  );
}
