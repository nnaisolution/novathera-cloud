import Link from "next/link";

import { HomePageV2FooterSignupForm } from "@/components/features/home-page-v2/components/home-page-v2-footer-signup-form";
import {
  homePageV2FooterContactItems,
  homePageV2FooterExploreLinks,
  homePageV2FooterLegalLinks,
} from "@/components/features/home-page-v2/home-page-v2-footer-data";
import { cn } from "@/lib/utils";

type HomePageV2FooterSectionProps = {
  className?: string;
};

function FooterLinkColumn({
  title,
  children,
  className,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-[14px] tracking-[2px] text-[#f8f5ec]/50 uppercase">
        {title}
      </p>
      <div
        className={cn(
          "flex flex-col gap-4 text-[16px] text-[#f8f5ec]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function HomePageV2FooterSection({
  className,
}: HomePageV2FooterSectionProps) {
  return (
    <footer className={cn("bg-[#185b50] px-6 lg:px-[200px]", className)}>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-20 px-0 py-16 lg:px-10 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <h2 className="font-display text-4xl leading-[1.2] text-[#f8f5ec] sm:text-5xl lg:text-[60px]">
              <span className="block">Begin your ritual</span>
              <span className="block">
                with <span className="text-[#bf913d] italic">Nova Thera.</span>
              </span>
            </h2>

            <p className="max-w-[512px] text-[16px] leading-normal text-[#f8f5ec]/80">
              Join a community redefining what wellness can feel like — slower,
              smarter, and entirely your own.
            </p>

            <HomePageV2FooterSignupForm />
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:col-span-5">
            <FooterLinkColumn title="Explore">
              {homePageV2FooterExploreLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              ))}
            </FooterLinkColumn>

            <FooterLinkColumn title="Contact" contentClassName="opacity-90">
              {homePageV2FooterContactItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-opacity hover:opacity-70"
                  {...(item.href.startsWith("http")
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {item.label}
                </Link>
              ))}
            </FooterLinkColumn>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-[rgba(248,245,236,0.15)] pt-[33px] opacity-70 sm:flex-row sm:items-center">
          <p className="text-[16px] text-[#f8f5ec]">
            © 2026 Nova Thera. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {homePageV2FooterLegalLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[16px] text-[#f8f5ec] transition-opacity hover:opacity-70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
