import { Star } from "lucide-react";

import type { HomePageV2Testimonial } from "@/components/features/home-page-v2/home-page-v2-testimonials-data";
import { cn } from "@/lib/utils";

type HomePageV2StarRatingProps = {
  className?: string;
  starClassName?: string;
};

export function HomePageV2StarRating({
  className,
  starClassName,
}: HomePageV2StarRatingProps) {
  return (
    <div className={cn("flex items-center", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "fill-[#bf913d] text-[#bf913d]",
            starClassName ?? "size-3.5",
          )}
        />
      ))}
    </div>
  );
}

type HomePageV2TestimonialCardProps = {
  testimonial: HomePageV2Testimonial;
  className?: string;
};

export function HomePageV2TestimonialCard({
  testimonial,
  className,
}: HomePageV2TestimonialCardProps) {
  return (
    <figure
      className={cn(
        "flex min-h-[272px] flex-col gap-5 rounded-[28px] border border-[#d8d8cd] bg-[#faf7ee] p-[29px]",
        className,
      )}
    >
      <HomePageV2StarRating />

      <blockquote className="text-lg leading-normal text-[#546256]">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-auto flex flex-col gap-0.5">
        <p className="text-base font-medium text-[#0c1f13]">{testimonial.name}</p>
        <p className="text-sm text-[#546256]">{testimonial.subtitle}</p>
      </figcaption>
    </figure>
  );
}
