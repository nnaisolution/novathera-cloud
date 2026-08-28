import Image from "next/image";

import { landingAssets } from "@/components/features/landing/assets";
import { siteNavigation } from "@/components/shared/site-navigation";
import {
  MembershipPlanCard,
  type MembershipPlan,
} from "@/components/features/landing/components/membership-plan-card";

const plans: MembershipPlan[] = [
  {
    tagline: "Restore. Recover. Recharge.",
    title: "Recovery Membership",
    description:
      "Therapeutic recovery and pain management treatments with ongoing wellness support.",
    features: [
      "Monthly recovery sessions",
      "Consultations",
      "Member pricing",
      "Progress tracking",
    ],
    ctaLabel: "Join Program",
    ctaHref: siteNavigation.comingSoon,
    featured: false,
  },
  {
    tagline: "Advanced Aesthetic Care, Personalized.",
    title: "Skin Optimization Program",
    description:
      "A results-driven program focused on skin rejuvenation, hydration, tightening, and long-term skin health.",
    features: [
      "Monthly skin treatments",
      "Personalized skincare guidance",
      "Facial & laser treatment benefits",
      "Exclusive member pricing",
      "Treatment progress monitoring",
    ],
    ctaLabel: "Explore Program",
    ctaHref: siteNavigation.comingSoon,
    featured: true,
  },
  {
    tagline: "Optimize Energy, Performance & Recovery.",
    title: "Biohacking Membership",
    description:
      "A premium wellness program combining advanced therapies and data-driven optimization for modern lifestyles.",
    features: [
      "IV therapy sessions",
      "BioCharger / PEMF access",
      "Wellness consultations",
      "Performance tracking",
    ],
    ctaLabel: "Get Started",
    ctaHref: siteNavigation.comingSoon,
    featured: false,
  },
];

export function MembershipSection() {
  return (
    <section className="relative overflow-hidden bg-[#023a40] px-6 py-20 md:px-12 lg:px-[160px] lg:py-[160px]">
      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-[60px]">
        <div className="flex flex-col items-center gap-2.5 text-center text-white">
          <h2 className="font-display text-4xl md:text-5xl lg:text-[60px] lg:leading-tight">
            Membership & Wellness Programs
          </h2>
          <p className="max-w-3xl text-base leading-normal">
            Personalized wellness memberships designed to support recovery,
            performance, and long-term well-being
            <br className="hidden sm:inline" />
            through consistent care and advanced therapies.
          </p>
        </div>

        <div className="z-20 flex flex-col items-center justify-center gap-10 lg:flex-row lg:items-end lg:gap-[60px]">
          {plans.map((plan) => (
            <MembershipPlanCard key={plan.title} {...plan} />
          ))}
        </div>
      </div>

      <Image
        src={landingAssets.membership.orangePeel}
        alt=""
        width={155}
        height={103}
        className="pointer-events-none absolute top-[20%] left-[8%] hidden -rotate-90 opacity-90 lg:block"
      />
      <Image
        src={landingAssets.membership.leaf}
        alt=""
        width={330}
        height={220}
        className="pointer-events-none absolute -right-40 bottom-[0%] hidden rotate-[-121deg] opacity-90 lg:block"
      />
    </section>
  );
}
