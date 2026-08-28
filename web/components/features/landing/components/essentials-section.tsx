import Image from "next/image";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import { buttonVariants } from "@/components/ui/button";

export function EssentialsSection() {
  return (
    <section className="grid min-h-[600px] lg:grid-cols-2">
      <div className="flex flex-col justify-center bg-[#f2f2ef] px-8 py-16 lg:px-[100px] lg:py-24">
        <h2 className="font-display text-4xl leading-tight text-[#023a40] md:text-5xl lg:text-[60px]">
          Wellness Essentials, Curated by Nova Thera
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#222]">
          A curated collection of therapeutic skincare and wellness essentials
          designed to extend the benefits of your Nova Thera treatments into
          your daily routine.
        </p>
        <Link
          href={siteNavigation.comingSoon}
          className={buttonVariants({
            className:
              "mt-8 h-[51px] w-fit rounded-2xl bg-[#023a40] px-8 text-base font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90",
          })}
        >
          Shop now
        </Link>
      </div>
      <div className="relative min-h-[400px] lg:min-h-[960px]">
        <Image
          src="https://www.figma.com/api/mcp/asset/422a1210-a3ae-4c4d-845c-31b769147e5a"
          alt="Wellness essentials"
          fill
          className="object-cover"
          sizes="50vw"
        />
      </div>
    </section>
  );
}
