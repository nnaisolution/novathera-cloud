import Image from "next/image";
import type { ReactNode } from "react";

import { HomePageV2ScrollHeader } from "@/components/features/home-page-v2/components/home-page-v2-scroll-header";
import { cn } from "@/lib/utils";

type PageHeroBannerProps = {
  backgroundImage: string;
  title: ReactNode;
  description?: string;
  /** Dark overlay with light text (home) vs plain image with dark text (about). */
  tone?: "dark" | "light";
  /** Vertical placement of title and copy. */
  contentPosition?: "bottom" | "center";
  titleClassName?: string;
  contentClassName?: string;
  className?: string;
  heightClass?: string;
  /** Renders the home page scroll header inside the hero. */
  withHomeHeader?: boolean;
  /** Overlay header style when `withHomeHeader` is enabled. */
  homeHeaderOverlayVariant?: "overlay" | "sticky";
  header?: ReactNode;
  children?: ReactNode;
};

export function PageHeroBanner({
  backgroundImage,
  title,
  description,
  tone = "dark",
  contentPosition,
  titleClassName,
  contentClassName,
  className,
  heightClass = "min-h-[min(1000px,100svh)]",
  withHomeHeader = false,
  homeHeaderOverlayVariant = "overlay",
  header,
  children,
}: PageHeroBannerProps) {
  const isDarkTone = tone === "dark";
  const isCentered =
    contentPosition === "center" || (!contentPosition && !isDarkTone);

  return (
    <section
      className={cn("relative w-full overflow-hidden", heightClass, className)}
    >
      <Image
        src={backgroundImage}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {isDarkTone ? (
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      ) : null}

      {withHomeHeader ? (
        <HomePageV2ScrollHeader overlayVariant={homeHeaderOverlayVariant} />
      ) : header ? (
        <div className="absolute inset-x-0 top-0 z-20 pt-[50px]">
          <div className="container mx-auto">{header}</div>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none relative z-10 container mx-auto flex min-h-[inherit] flex-col",
          isCentered
            ? "items-start justify-center pt-[140px] pb-16 lg:pt-[180px]"
            : "justify-end pt-32 pb-16 md:pb-20 lg:pt-40 lg:pb-[60px]",
        )}
      >
        <div
          className={cn(
            "pointer-events-auto w-full",
            isCentered
              ? "max-w-[640px] space-y-3.5"
              : "max-w-[847px] space-y-10",
            contentClassName,
          )}
        >
          <div className={cn(isCentered ? "space-y-3.5" : "space-y-5")}>
            <h1
              className={cn(
                "font-display leading-tight",
                isDarkTone
                  ? "text-4xl text-white sm:text-5xl lg:text-[72px] lg:leading-[1.05]"
                  : "text-4xl text-[#023a40] sm:text-5xl lg:text-[72px] lg:leading-normal",
                titleClassName,
              )}
            >
              {title}
            </h1>
            {description ? (
              <p
                className={cn(
                  isDarkTone
                    ? isCentered
                      ? "max-w-xl text-base leading-[1.5] text-white/95"
                      : "max-w-[847px] text-xl leading-[1.5] text-white"
                    : "text-base leading-[1.5] text-[#222]",
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
