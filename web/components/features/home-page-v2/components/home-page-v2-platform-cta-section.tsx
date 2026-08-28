import Image from "next/image";
import Link from "next/link";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2PlatformCtaSectionProps = {
  className?: string;
};

export function HomePageV2PlatformCtaSection({
  className,
}: HomePageV2PlatformCtaSectionProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative h-[500px] w-full sm:h-[600px] lg:h-[700px]">
        <Image
          src={homePageV2Assets.platformCta.background}
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        <div
          className="absolute inset-0 bg-[linear-gradient(270deg,rgba(12,31,19,0.8)_0%,rgba(12,31,19,0.2)_62%,rgba(12,31,19,0)_100%)]"
          aria-hidden
        />

        <div className="absolute inset-0 flex items-center justify-end px-6 lg:px-[200px]">
          <div className="flex max-w-[700px] flex-col gap-10">
            <h2 className="font-display text-4xl text-white sm:text-5xl lg:text-[60px] lg:leading-tight">
              <span className="block">A system, not a service.</span>
              <span className="block">A platform, not a clinic.</span>
            </h2>
            <Link
              href={siteNavigation.book}
              className="inline-flex h-[50px] w-fit items-center justify-center rounded-full bg-[#faf7ee] px-7 text-base font-medium text-[#0c1f13] transition-colors hover:bg-[#faf7ee]/90"
            >
              Book Consultation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
