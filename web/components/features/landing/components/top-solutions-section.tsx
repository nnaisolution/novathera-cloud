"use client";

import Image from "next/image";
import { useState } from "react";

import { CategoryChips } from "@/components/features/landing/components/category-chips";
import {
  getServiceTitle,
  ServiceCard,
} from "@/components/features/landing/components/service-card";
import { landingAssets } from "@/components/features/landing/assets";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const categories = [
  "Top Solutions",
  "Weight Management",
  "Skin & Dermat",
  "Hair",
  "Body",
  "Bridal",
  "Laser",
] as const;

const solutions = [
  {
    title: "Botox",
    image: landingAssets.topSolutions.botox,
  },
  {
    title: "Body Therapy",
    image: landingAssets.topSolutions.bodyTherapy,
  },
  {
    title: "Cosmedermat Facials",
    image: landingAssets.topSolutions.cosmedermatFacials,
  },
  {
    title: "Whitening treatment",
    image: landingAssets.topSolutions.whiteningTreatment,
  },
] as const;

export function TopSolutionsSection() {
  const [active, setActive] = useState<(typeof categories)[number]>(
    categories[0],
  );

  return (
    <section id="solutions" className="bg-[#f2f2ef]">
      <div className="isolate flex w-full flex-col lg:min-h-[960px] lg:flex-row lg:items-center">
        {/* Left column — hero image (Figma 1:401) */}
        <div className="relative z-2 h-[min(480px,70vw)] w-full shrink-0 overflow-hidden rounded-tr-[30px] bg-[#ebebeb] lg:h-[960px] lg:min-h-[960px] lg:flex-1">
          <Image
            src={landingAssets.topSolutions.hero}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Right column — title, chips, carousel (Figma 1:403) */}
        <div className="flex min-w-0 flex-1 items-center self-stretch">
          <div className="flex w-full min-w-0 flex-col items-start justify-center gap-10 px-6 py-16 lg:gap-10 lg:px-[100px] lg:py-20">
            <div className="flex w-full flex-col items-start gap-2.5">
              <h2 className="font-display text-left text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
                Top Solutions
              </h2>
              <p className="text-left text-base leading-normal text-[#222]">
                Explore our range of solutions for your specific concerns
              </p>
            </div>

            <CategoryChips
              categories={categories}
              active={active}
              onChange={setActive}
              className="w-full scrollbar-none items-start justify-start overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            />

            <div className="relative w-full min-w-0 overflow-visible px-10 sm:px-12">
              <Carousel
                opts={{
                  align: "start",
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-5">
                  {solutions.map((solution) => (
                    <CarouselItem
                      key={getServiceTitle(solution.title)}
                      className="basis-[min(100%,385px)] pl-5 md:basis-[385px]"
                    >
                      <ServiceCard
                        {...solution}
                        heightClass="h-[491px]"
                        className="w-full max-w-[385px]"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious
                  variant="outline"
                  className="z-10 size-10 rounded-full border-[#023a40]/30 bg-white text-[#023a40] shadow-md hover:bg-[#023a40]/5 hover:text-[#023a40] disabled:border-[#023a40]/10 disabled:bg-white/80"
                />
                <CarouselNext
                  variant="outline"
                  className="z-10 size-10 rounded-full border-[#023a40]/30 bg-white text-[#023a40] shadow-md hover:bg-[#023a40]/5 hover:text-[#023a40] disabled:border-[#023a40]/10 disabled:bg-white/80"
                />
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
