"use client";

import { notFound } from "next/navigation";

import { AboutCtaSection } from "@/components/features/about-us/components/about-cta-section";
import { AboutStatsSection } from "@/components/features/about-us/components/about-stats-section";
import { AboutStorySection } from "@/components/features/about-us/components/about-story-section";
import { AboutTeamSection } from "@/components/features/about-us/components/about-team-section";
import { HomePageV2FooterSection } from "@/components/features/home-page-v2/components/home-page-v2-footer-section";
import { HomePageV2InstagramSection } from "@/components/features/home-page-v2/components/home-page-v2-instagram-section";
import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";

import { useServiceDetail } from "../hooks/use-service-detail";
import { ServiceDetailHero } from "./service-detail-hero";

export function ServiceDetailView({ slug }: { slug: string }) {
  const serviceQuery = useServiceDetail(slug);

  if (serviceQuery.isLoading) {
    return (
      <>
        <main className="min-h-screen bg-[#faf7ee]">
          <HomePageV2ScrollHeader overlayVariant="sticky" />
          <div className="mx-auto w-full max-w-[1280px] px-6 pt-[200px] pb-20 lg:px-10">
            <div className="h-10 w-64 animate-pulse rounded bg-[#edffe3]" />
            <div className="mt-4 h-16 w-96 animate-pulse rounded bg-[#edffe3]" />
            <div className="mt-4 h-6 w-80 animate-pulse rounded bg-[#edffe3]" />
          </div>
        </main>
        <HomePageV2FooterSection />
      </>
    );
  }

  if (serviceQuery.isError || !serviceQuery.data) {
    notFound();
  }

  const service = serviceQuery.data;

  return (
    <>
      <main className="flex flex-col bg-[#faf7ee]">
        <HomePageV2ScrollHeader overlayVariant="sticky" />
        <ServiceDetailHero service={service} />
        <AboutStorySection />
        <AboutStatsSection />
        <AboutTeamSection />
        <HomePageV2InstagramSection className="bg-[#faf7ee]" />
        <AboutCtaSection />
      </main>
      <HomePageV2FooterSection />
    </>
  );
}
