import {
  HomePageV2StarRating,
  HomePageV2TestimonialCard,
} from "@/components/features/home-page-v2/components/home-page-v2-testimonial-card";
import {
  homePageV2Testimonials,
  homePageV2TestimonialsRating,
} from "@/components/features/home-page-v2/home-page-v2-testimonials-data";
import { cn } from "@/lib/utils";

type HomePageV2TestimonialsSectionProps = {
  className?: string;
};

export function HomePageV2TestimonialsSection({
  className,
}: HomePageV2TestimonialsSectionProps) {
  return (
    <section
      className={cn(
        "bg-[rgba(229,235,216,0.4)] px-6 pt-[100px] pb-[50px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="text-sm tracking-[2px] text-[#546256] uppercase">
              Voices
            </p>
            <h2 className="font-display text-4xl text-[#0c1f13] sm:text-5xl lg:text-[60px]">
              <span>Redefine the </span>
              <span className="text-[#bf913d]">way you feel.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <HomePageV2StarRating starClassName="size-[18px]" />
            <p className="text-lg text-[#546256]">
              {homePageV2TestimonialsRating.score} from{" "}
              {homePageV2TestimonialsRating.reviewCount} reviews
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {homePageV2Testimonials.map((testimonial) => (
            <HomePageV2TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
