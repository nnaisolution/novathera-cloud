"use client";

import Link from "next/link";
import { useState } from "react";

import { HomePageV2ServiceCardItem } from "@/components/features/home-page-v2/components/home-page-v2-service-card";
import { HomePageV2ServicesFeatured } from "@/components/features/home-page-v2/components/home-page-v2-services-featured";
import {
  homePageV2ServiceCards,
  homePageV2ServiceCategories,
  type HomePageV2ServiceCategoryId,
} from "@/components/features/home-page-v2/home-page-v2-services-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type HomePageV2OurServicesSectionProps = {
  className?: string;
};

export function HomePageV2OurServicesSection({
  className,
}: HomePageV2OurServicesSectionProps) {
  const [activeCategory, setActiveCategory] =
    useState<HomePageV2ServiceCategoryId>("all");

  const filteredCards =
    activeCategory === "all"
      ? homePageV2ServiceCards
      : homePageV2ServiceCards.filter(
          (card) => card.categoryId === activeCategory,
        );

  return (
    <section
      className={cn(
        "bg-[rgba(229,235,216,0.4)] px-6 py-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-4">
            <p className="text-sm tracking-[2px] text-[#546256] uppercase">
              our services
            </p>
            <h2 className="font-display text-4xl leading-[1.2] sm:text-5xl lg:text-[60px]">
              <span className="block text-[#0c1f13]">40+ modalities,</span>
              <span className="block text-[#bf913d]">infinitely personalized.</span>
            </h2>
          </div>

          <div className="flex max-w-md flex-col gap-5 lg:items-start">
            <p className="text-lg leading-normal text-[#546256]">
              Filter by category to explore every service — each tagged by
              billing path.
            </p>
            <Link
              href={siteNavigation.services}
              className="inline-flex w-fit items-center justify-center rounded-full bg-[#185b50] px-7 py-3.5 text-base font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
            >
              View All Services
            </Link>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full pt-2"
        >
          <CarouselContent className="-ml-2">
            {homePageV2ServiceCategories.map((category) => {
              const isActive = activeCategory === category.id;

              return (
                <CarouselItem key={category.id} className="basis-auto pl-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-[#185b50] text-[#f8f5ec]"
                        : "border border-[#d8d8cd] bg-[#faf7ee] text-[rgba(12,31,19,0.7)] hover:bg-[#faf7ee]/80",
                    )}
                  >
                    {category.label}
                  </button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-[60px]">
          <HomePageV2ServicesFeatured className="w-full lg:max-w-[50%]" />

          <div className="flex w-full flex-col gap-4 lg:max-w-[50%]">
            {filteredCards.length > 0 ? (
              filteredCards.map((card) => (
                <HomePageV2ServiceCardItem key={card.id} card={card} />
              ))
            ) : (
              <div className="flex flex-col items-start gap-4 rounded-[20px] border border-[#d8d8cd] p-8">
                <p className="text-base text-[#546256]">
                  More{" "}
                  {
                    homePageV2ServiceCategories.find(
                      (category) => category.id === activeCategory,
                    )?.label
                  }{" "}
                  services are listed in the full catalogue.
                </p>
                <Link
                  href={siteNavigation.services}
                  className="inline-flex w-fit items-center justify-center rounded-full bg-[#185b50] px-6 py-3 text-sm font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
                >
                  View All Services
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
