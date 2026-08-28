import Image from "next/image";
import Link from "next/link";

import { landingAssets } from "@/components/features/landing/assets";
import {
  footerNavItems,
  siteNavigation,
} from "@/components/shared/site-navigation";

export function FooterSection() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-[#023a40] pt-20 pb-32 text-white lg:pt-40 lg:pb-[260px]"
    >
      <Image
        src={landingAssets.footer.decorLogo}
        alt=""
        width={581}
        height={569}
        aria-hidden
        className="pointer-events-none absolute -top-9 right-0 hidden w-[min(40vw,581px)] opacity-20 lg:block"
      />

      <p
        aria-hidden
        className="font-display pointer-events-none absolute right-1/2 bottom-[280px] translate-x-1/2 translate-y-full bg-gradient-to-t from-white to-white/0 bg-clip-text text-center text-[clamp(4rem,22vw,400px)] leading-none whitespace-nowrap text-transparent opacity-[0.06]"
      >
        Nova Thera
      </p>

      <div className="relative container mx-auto flex flex-col gap-[60px]">
        <div className="flex flex-col items-start justify-between gap-12 lg:flex-row lg:gap-16">
          <div className="flex max-w-[653px] flex-col gap-10">
            <Link
              href={siteNavigation.home}
              className="relative block h-[100px] w-[280px] sm:w-[412px]"
            >
              <Image
                src={landingAssets.logoDark}
                alt="Nova Thera"
                fill
                className="object-contain object-left"
              />
            </Link>

            <p className="text-xl leading-normal text-white">
              Nova Thera is your trusted destination for advanced skincare,
              hair, and wellness solutions. We combine science-backed treatments
              with expert care to deliver real, lasting results.
            </p>

            <div className="flex items-center gap-[19px]">
              {(
                [
                  {
                    label: "Instagram",
                    src: landingAssets.footer.socialInstagram,
                  },
                  { label: "X", src: landingAssets.footer.socialX },
                  {
                    label: "Facebook",
                    src: landingAssets.footer.socialFacebook,
                  },
                ] as const
              ).map((social) => (
                <Link
                  key={social.label}
                  href={siteNavigation.comingSoon}
                  aria-label={social.label}
                  className="transition-opacity hover:opacity-80"
                >
                  <Image
                    src={social.src}
                    alt=""
                    width={24}
                    height={24}
                    className="size-6"
                  />
                </Link>
              ))}
            </div>
          </div>

          <nav className="flex w-full max-w-[400px] flex-col gap-10">
            {footerNavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-display text-3xl leading-normal text-white transition-opacity hover:opacity-80 lg:text-[40px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="h-px w-full bg-white/10" aria-hidden />

        <div className="flex flex-col gap-6 text-xl leading-normal text-white md:flex-row md:items-center md:justify-between">
          <p className="whitespace-nowrap">
            Copyright © Nova Thera 2026. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link
              href={siteNavigation.privacyPolicy}
              className="transition-opacity hover:opacity-80"
            >
              Privacy Policy
            </Link>
            <span className="h-5 w-px rounded-sm bg-white/10" aria-hidden />
            <Link
              href={siteNavigation.terms}
              className="transition-opacity hover:opacity-80"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
