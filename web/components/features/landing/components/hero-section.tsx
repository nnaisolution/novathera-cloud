import Link from "next/link";

import { landingAssets } from "@/components/features/landing/assets";
import { PageHeroBanner } from "@/components/shared/page-hero-banner";
import { siteNavigation } from "@/components/shared/site-navigation";
import { WaitlistTrigger } from "@/components/shared/waitlist-trigger";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <PageHeroBanner
      backgroundImage={landingAssets.heroBackground}
      tone="dark"
      contentPosition="bottom"
      heightClass="h-[1000px] min-h-[1000px]"
      title={
        <>
          AI-Powered Integrative
          <br />
          Wellness for Modern Living
        </>
      }
      description="Nova Thera is opening soon in september. Join the waitlist for early access to advanced aesthetics, recovery therapies, diagnostics, and biohacking — personalized through data, science, and holistic care."
    >
      <div className="flex flex-col gap-5 sm:flex-row">
        <Link
          href={siteNavigation.services}
          className={buttonVariants({
            className:
              "h-[51px] rounded-2xl bg-white px-8 text-base font-normal tracking-wide !text-black uppercase hover:bg-white/90 hover:!text-white",
          })}
        >
          Explore services
        </Link>
        <WaitlistTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-[51px] rounded-2xl border-white bg-transparent px-8 text-base font-normal tracking-wide text-white uppercase hover:bg-white/10 hover:text-white",
          )}
        >
          Join the waitlist
        </WaitlistTrigger>
      </div>
    </PageHeroBanner>
  );
}
