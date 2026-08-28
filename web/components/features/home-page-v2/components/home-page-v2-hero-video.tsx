"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { cn } from "@/lib/utils";

type HomePageV2HeroVideoProps = {
  className?: string;
};

export function HomePageV2HeroVideo({ className }: HomePageV2HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.loop = true;
    video.playsInline = true;

    const playPromise = video.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay may be blocked until user interaction; muted video usually works.
      });
    }
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <Image
        src={homePageV2Assets.hero.poster}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
        aria-hidden
      />
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={homePageV2Assets.hero.poster}
        aria-hidden
      >
        <source src={homePageV2Assets.hero.video} type="video/mp4" />
      </video>
    </div>
  );
}
