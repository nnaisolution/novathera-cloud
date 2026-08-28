import Image from "next/image";
import Link from "next/link";

import {
  HomePageV2StarRating,
  HomePageV2TestimonialCard,
} from "@/components/features/home-page-v2/components/home-page-v2-testimonial-card";
import {
  homePageV2Testimonials,
  homePageV2TestimonialsRating,
} from "@/components/features/home-page-v2/home-page-v2-testimonials-data";
import { shopAssets } from "@/components/features/shop/assets";
import { shopVoicesBrandCopy } from "@/components/features/shop/shop-data";
import { cn } from "@/lib/utils";

type ShopVoicesBrandSectionProps = {
  className?: string;
};

/**
 * Figma node 14:155 — Voices cards over a product showcase scene.
 * Background asset already includes the product lineup; overlays are content only.
 */
export function ShopVoicesBrandSection({
  className,
}: ShopVoicesBrandSectionProps) {
  return (
    <section
      className={cn(
        "relative w-full overflow-hidden bg-[#e8f0d8]",
        className,
      )}
    >
      <div className="relative mx-auto flex min-h-[900px] w-full flex-col lg:min-h-[1208px] lg:max-w-[1920px]">
        <Image
          src={shopAssets.voicesBackground}
          alt=""
          fill
          priority={false}
          className="object-cover object-[center_35%] lg:object-center"
          sizes="100vw"
        />

        {/* Cream fade so Voices sits on a soft surface like Figma */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[280px] bg-gradient-to-b from-[#faf7ee] from-[12%] via-[#faf7ee]/70 to-transparent lg:h-[392px]"
          aria-hidden
        />

        {/* Watermark — mid/lower, behind CTA copy */}
        <p
          className="font-display pointer-events-none absolute top-[54%] left-1/2 z-[1] hidden w-full -translate-x-1/2 bg-gradient-to-b from-[rgba(2,58,64,0.18)] to-transparent bg-clip-text text-center text-[160px] leading-none font-normal tracking-tight text-transparent select-none lg:block xl:text-[280px] 2xl:text-[360px]"
          aria-hidden
        >
          Nova&nbsp;&nbsp;Thera
        </p>

        {/* Decorative leaves — keep small so they don’t dominate */}
        <Image
          src={shopAssets.leaf}
          alt=""
          width={140}
          height={93}
          className="pointer-events-none absolute bottom-[22%] left-[-1%] z-[2] hidden w-[110px] -rotate-[50deg] drop-shadow-md lg:block xl:w-[140px]"
          aria-hidden
        />
        <Image
          src={shopAssets.leaf}
          alt=""
          width={100}
          height={67}
          className="pointer-events-none absolute top-[48%] left-[28%] z-[2] hidden w-[70px] -rotate-[120deg] opacity-80 blur-[1px] lg:block"
          aria-hidden
        />
        <Image
          src={shopAssets.leaf}
          alt=""
          width={130}
          height={87}
          className="pointer-events-none absolute right-[10%] bottom-[32%] z-[2] hidden w-[100px] -rotate-[100deg] drop-shadow-md lg:block xl:w-[130px]"
          aria-hidden
        />

        {/* Voices — upper band */}
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-6 pt-16 lg:gap-16 lg:px-10 lg:pt-[100px] xl:px-0">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
            <div className="flex flex-col gap-[18px]">
              <p className="text-sm tracking-[2px] text-[#546256] uppercase">
                Voices
              </p>
              <h2 className="font-display text-4xl text-[#0c1f13] sm:text-5xl lg:text-[48px] lg:leading-none">
                <span>Redefine the </span>
                <span className="text-[#bf913d]">way you feel.</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <HomePageV2StarRating starClassName="size-[18px]" />
              <p className="text-lg text-[#546256]">
                {homePageV2TestimonialsRating.score} from{" "}
                {homePageV2TestimonialsRating.reviewCount} reviews
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {homePageV2Testimonials.map((testimonial) => (
              <HomePageV2TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>

        {/* Spacer keeps CTA below the product cluster on desktop */}
        <div className="relative z-10 hidden flex-1 lg:block" aria-hidden />

        {/* Bottom brand CTA — flanks the product photo */}
        <div className="relative z-10 mx-auto mt-auto flex w-full max-w-[1600px] flex-col gap-8 px-6 pt-48 pb-12 sm:pt-56 lg:mt-0 lg:flex-row lg:items-end lg:justify-between lg:px-20 lg:pt-0 lg:pb-[60px]">
          <h2 className="font-display max-w-[300px] text-4xl leading-none text-[#185b50] lg:text-[48px]">
            <span className="block">{shopVoicesBrandCopy.headlineLine1}</span>
            <span className="block">{shopVoicesBrandCopy.headlineLine2}</span>
          </h2>

          <div className="flex max-w-[385px] flex-col gap-[30px]">
            <p className="text-base leading-normal text-[#222]">
              {shopVoicesBrandCopy.body}
            </p>
            <Link
              href="#shop-catalog"
              className="inline-flex h-[51px] w-fit items-center justify-center rounded-2xl bg-white px-[30px] text-base text-black uppercase transition-opacity hover:opacity-90"
            >
              {shopVoicesBrandCopy.cta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
