import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2OurApproachSectionProps = {
  className?: string;
};

function ApproachImage({
  src,
  alt,
  className,
  imageClassName,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  sizes: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-[20px]", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", imageClassName)}
        sizes={sizes}
      />
    </div>
  );
}

export function HomePageV2OurApproachSection({
  className,
}: HomePageV2OurApproachSectionProps) {
  const images = homePageV2Assets.ourApproach;

  return (
    <section
      className={cn(
        "flex flex-col gap-20 bg-[#faf7ee] px-6 py-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col justify-between gap-8 lg:min-h-[193px]">
          <p className="text-sm tracking-[2px] text-[#546256] uppercase">
            Our approach
          </p>
          <h2 className="font-display text-4xl leading-[1.2] sm:text-5xl lg:text-[60px]">
            <span className="block text-[#0c1f13]">Redefining wellness</span>
            <span className="block text-[#0c1f13]">
              through{" "}
              <span className="italic text-[#bf913d]">science & care.</span>
            </span>
          </h2>
        </div>

        <div className="flex max-w-[500px] flex-col gap-8">
          <p className="text-lg leading-normal text-[#546256]">
            We pair clinical precision with sensory rituals — translating modern
            research into care that feels human, slow, and unmistakably yours.
          </p>
          <Link
            href={siteNavigation.aboutUs}
            className="inline-flex w-fit items-baseline gap-2 font-display text-2xl tracking-[-0.24px] text-[#0c1f13] transition-opacity hover:opacity-70"
          >
            Learn more
            <ArrowRight className="size-6" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6">
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-end lg:justify-center">
          <ApproachImage
            src={images.skincareConsultation}
            alt="Skincare consultation"
            className="h-[320px] w-full sm:h-[440px] lg:h-[590px] lg:w-[58%]"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          <ApproachImage
            src={images.wellnessPortrait}
            alt="Wellness portrait"
            className="h-[280px] w-full sm:h-[400px] lg:h-[540px] lg:w-[42%]"
            imageClassName="object-[center_20%]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
        </div>

        <div className="flex flex-col items-center gap-6 lg:flex-row">
          <ApproachImage
            src={images.massageTherapy}
            alt="Massage therapy"
            className="h-[280px] w-full sm:h-[360px] lg:h-[442px] lg:w-[35%]"
            sizes="(max-width: 1024px) 100vw, 35vw"
          />
          <ApproachImage
            src={images.yogaOutdoors}
            alt="Yoga outdoors"
            className="h-[280px] w-full sm:h-[360px] lg:h-[442px] lg:w-[65%]"
            sizes="(max-width: 1024px) 100vw, 65vw"
          />
        </div>
      </div>
    </section>
  );
}
