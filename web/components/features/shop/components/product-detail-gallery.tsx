"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { ProductImage } from "@/components/features/shop/types";
import { cn } from "@/lib/utils";

type ProductDetailGalleryProps = {
  images: ProductImage[];
  className?: string;
};

export function ProductDetailGallery({
  images,
  className,
}: ProductDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const largeRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const target = largeRefs.current[activeIndex];
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [activeIndex]);

  if (images.length === 0) return null;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5 lg:flex-row lg:items-start lg:gap-5",
        className,
      )}
    >
      {/* Thumbnails — horizontal on mobile, vertical on desktop */}
      <div className="flex shrink-0 gap-3 overflow-x-auto lg:w-[115px] lg:flex-col lg:gap-5 lg:overflow-visible">
        {images.map((image, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={isActive}
              className={cn(
                "relative size-[88px] shrink-0 overflow-hidden rounded-[12px] bg-[#edffe3] transition-shadow lg:size-[115px] lg:rounded-[16px]",
                isActive
                  ? "ring-2 ring-[#185b50] ring-offset-2 ring-offset-[#faf7ee]"
                  : "opacity-90 hover:opacity-100",
              )}
            >
              <Image
                src={image.src}
                alt=""
                fill
                unoptimized={image.src.startsWith("http")}
                className="object-cover"
                sizes="115px"
              />
            </button>
          );
        })}
      </div>

      {/* Large stack */}
      <div className="flex w-full flex-col gap-5 lg:max-w-[620px]">
        {images.map((image, index) => (
          <div
            key={`${image.src}-large-${index}`}
            ref={(node) => {
              largeRefs.current[index] = node;
            }}
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-[20px] bg-[#edffe3]",
              index !== activeIndex && "hidden lg:block",
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              unoptimized={image.src.startsWith("http")}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 620px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
