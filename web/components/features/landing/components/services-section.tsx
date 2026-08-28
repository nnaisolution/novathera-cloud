"use client";

import { useState } from "react";

import { landingAssets } from "@/components/features/landing/assets";
import { CategoryChips } from "@/components/features/landing/components/category-chips";
import {
  getServiceTitle,
  ServiceCard,
} from "@/components/features/landing/components/service-card";

const categories = [
  "Top Concerns",
  "Weight Management",
  "Skin & Dermat",
  "Hair",
  "Body",
  "Bridal",
  "Laser",
] as const;

const services = [
  {
    title: ["Hair Thinning and Hair Loss"],
    image: landingAssets.serviceCards.hairThinning,
  },
  {
    title: "Laser Hair Removal",
    image: landingAssets.serviceCards.laserHairRemoval,
  },
  {
    title: "Dullness and Pigmentation",
    image: landingAssets.serviceCards.dullnessPigmentation,
  },
  {
    title: "Body Sculpting",
    image: landingAssets.serviceCards.bodySculpting,
  },
] as const;

export function ServicesSection() {
  const [active, setActive] = useState<(typeof categories)[number]>(
    categories[0],
  );

  return (
    <section
      id="services"
      className="bg-[#f2f2ef] px-6 py-20 md:px-12 lg:px-[160px] lg:pt-20 lg:pb-40"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2.5 text-center">
          <h2 className="font-display text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
            Explore Our Services
          </h2>
          <p className="text-base leading-normal text-[#222]">
            Explore our range of solutions for your specific concerns
          </p>
        </div>

        <CategoryChips
          categories={categories}
          active={active}
          onChange={setActive}
          className="justify-center"
        />

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={getServiceTitle(service.title)}
              {...service}
              className="flex-1"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
