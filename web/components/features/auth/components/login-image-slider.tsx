"use client";

import Image from "next/image";
import * as React from "react";

import { cn } from "@/lib/utils";

import {
  LOGIN_SLIDER_QUOTE,
  LOGIN_SLIDES,
} from "../utils/login-slides";

const SLIDE_INTERVAL_MS = 5000;

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 43 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M0 37.5V23.1C0 16.3 1.6 10.9 4.8 6.9C8 2.9 12.7 0.7 18.9 0.3V8.4C15.7 8.9 13.4 10.3 12 12.6C10.6 14.9 9.9 18 9.9 21.9H18.9V37.5H0ZM24.1 37.5V23.1C24.1 16.3 25.7 10.9 28.9 6.9C32.1 2.9 36.8 0.7 43 0.3V8.4C39.8 8.9 37.5 10.3 36.1 12.6C34.7 14.9 34 18 34 21.9H43V37.5H24.1Z"
        fill="white"
      />
    </svg>
  );
}

export function LoginImageSlider({ className }: { className?: string }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setSelectedIndex((current) => (current + 1) % LOGIN_SLIDES.length);
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className={cn("relative overflow-hidden rounded-[30px]", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="absolute inset-0 flex h-full transition-transform duration-700 ease-in-out will-change-transform"
        style={{
          width: `${LOGIN_SLIDES.length * 100}%`,
          transform: `translateX(-${(selectedIndex * 100) / LOGIN_SLIDES.length}%)`,
        }}
      >
        {LOGIN_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="relative h-full shrink-0"
            style={{ width: `${100 / LOGIN_SLIDES.length}%` }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={slide.id === "slide-1"}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[55%] bg-linear-to-b from-transparent to-black/80"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 px-6 pb-6 sm:px-10 sm:pb-8 lg:px-12 lg:pb-10">
        <div className="max-w-[810px]">
          <QuoteMark className="mb-3 hidden h-6 w-auto sm:block sm:h-7" />
          <p className="font-display text-lg leading-snug tracking-[0.01em] text-white sm:text-2xl lg:text-[32px]">
            {LOGIN_SLIDER_QUOTE}
          </p>
        </div>

        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Login slideshow"
        >
          {LOGIN_SLIDES.map((slide, index) => {
            const isActive = index === selectedIndex;

            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}`}
                className={cn(
                  "pointer-events-auto h-1 rounded-md bg-white transition-all",
                  isActive ? "w-[30px]" : "w-3 opacity-40 hover:opacity-70",
                )}
                onClick={() => setSelectedIndex(index)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
