import { ChevronDown } from "lucide-react";
// import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  headerNavItems,
  siteNavigation,
} from "@/components/shared/site-navigation";
import { SiteHeaderSession } from "@/components/shared/site-header-session";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  className?: string;
  activeItem?: (typeof headerNavItems)[number]["label"];
};

export function SiteHeader({ className, activeItem }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex w-full flex-wrap items-center justify-between gap-4 rounded-xl bg-white px-6 py-5 lg:flex-nowrap lg:gap-5 lg:px-8",
        className,
      )}
    >
      <nav className="order-2 flex w-full flex-wrap items-center gap-4 lg:order-2 lg:w-auto lg:gap-5">
        {headerNavItems.map((item) => {
          const isActive = activeItem === item.label;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col gap-0.5 text-[15px] text-[#1a1c18] transition-opacity hover:opacity-70",
                isActive && "gap-0.5",
              )}
            >
              <span className="flex items-center gap-1">
                {item.label}
                {"hasDropdown" in item && item.hasDropdown ? (
                  <ChevronDown className="size-3" aria-hidden />
                ) : null}
              </span>
              {isActive ? (
                <span className="h-px w-full rounded-sm bg-[#023a40]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <Link
        href={siteNavigation.home}
        className="relative order-1 mx-auto h-[50px] w-[180px] shrink-0 lg:order-1 lg:mx-0 lg:w-[206px]"
      >
        <Image
          src="/branding/logo_dark.svg"
          alt="Nova Thera"
          fill
          className="object-contain object-center"
          priority
        />
      </Link>

      <div className="order-3 ml-auto flex w-full items-center justify-end gap-4 lg:w-auto lg:gap-5">
        <Link
          href={siteNavigation.bookConsultation}
          className={buttonVariants({
            className:
              "h-[51px] rounded-2xl bg-[#023a40] px-6 text-sm font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90 lg:px-8",
          })}
        >
          Book consultation
        </Link>
        <SiteHeaderSession />
      </div>
    </header>
  );
}
