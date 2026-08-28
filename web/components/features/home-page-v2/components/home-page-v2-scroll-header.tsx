"use client";

import { useEffect, useRef, useState } from "react";

import { HomePageV2Header } from "@/components/features/home-page-v2/components/home-page-v2-header";
import { cn } from "@/lib/utils";

type HomePageV2ScrollHeaderProps = {
  /** Use `sticky` on light hero backgrounds so nav/logo stay readable. */
  overlayVariant?: "overlay" | "sticky";
};

export function HomePageV2ScrollHeader({
  overlayVariant = "overlay",
}: HomePageV2ScrollHeaderProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // The sentinel sits at the bottom of the hero. Sticky mode is "the hero has
    // scrolled past the top of the viewport" — not merely "the sentinel is off
    // screen", which is already true on first paint and would show the opaque
    // header over the hero.
    //
    // The bottom rootMargin matters: the observer only fires on threshold
    // crossings, and a hero exactly one viewport tall puts the sentinel right on
    // the root's bottom edge, where it may never register as inside and so never
    // crosses on scroll. Extending the root downwards guarantees the sentinel
    // starts inside it, so exiting via the top is always a real crossing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "0px 0px 100% 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute bottom-0 h-px w-full"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 z-20">
        <HomePageV2Header variant={overlayVariant} />
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[transform,opacity] duration-300 ease-out",
          isSticky
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
        )}
      >
        <HomePageV2Header variant="sticky" />
      </div>
    </>
  );
}
