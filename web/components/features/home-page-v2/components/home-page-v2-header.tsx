import Image from "next/image";
import Link from "next/link";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { HomePageV2HeaderActions } from "@/components/features/home-page-v2/components/home-page-v2-header-actions";
import { HomePageV2MobileMenu } from "@/components/features/home-page-v2/components/home-page-v2-mobile-menu";
import { homePageV2NavItems } from "@/components/features/home-page-v2/home-page-v2-nav";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2HeaderVariant = "overlay" | "sticky";

type HomePageV2HeaderProps = {
  className?: string;
  variant?: HomePageV2HeaderVariant;
};

export function HomePageV2Header({
  className,
  variant = "overlay",
}: HomePageV2HeaderProps) {
  const isSticky = variant === "sticky";

  return (
    <header
      className={cn(
        "w-full px-6 lg:px-[200px]",
        isSticky && "bg-[#eef0e1] shadow-[0px_4px_5px_rgba(0,0,0,0.1)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2 sm:gap-4 lg:gap-6",
          isSticky ? "h-[68px] lg:h-[100px]" : "h-[76px] lg:h-[120px]",
        )}
      >
        <Link
          href={siteNavigation.home}
          className="block h-10 w-[150px] shrink-0 sm:h-12 sm:w-[190px] lg:h-[70px] lg:w-[288px]"
        >
          <Image
            src={
              isSticky
                ? homePageV2Assets.header.logoDark
                : homePageV2Assets.header.logo
            }
            alt="Nova Thera"
            width={288}
            height={70}
            className="h-full w-full object-contain object-left"
            priority
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden min-w-0 flex-1 scrollbar-none items-center justify-center overflow-x-auto [-ms-overflow-style:none] xl:flex [&::-webkit-scrollbar]:hidden"
        >
          <div
            className={cn(
              "flex items-center gap-3 whitespace-nowrap",
              isSticky
                ? "text-[15px] text-[#185b50]"
                : "text-[14px] text-white",
            )}
          >
            {homePageV2NavItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-opacity hover:opacity-70"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <HomePageV2HeaderActions variant={variant} />
          <HomePageV2MobileMenu variant={variant} />
        </div>
      </div>
    </header>
  );
}
