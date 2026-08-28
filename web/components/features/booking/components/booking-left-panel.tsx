import Image from "next/image";

import { bookingAssets } from "@/components/features/booking/assets";

const features = [
  {
    icon: bookingAssets.icons.expertTreatments,
    title: "Expert-Led Treatments",
    description:
      "Expert-led treatments focused on safe, effective, and trusted results.",
  },
  {
    icon: bookingAssets.icons.personalizedApproach,
    title: "Personalized Approach",
    description:
      "Personalized treatment plans tailored to your unique needs and goals.",
  },
  {
    icon: bookingAssets.icons.advancedTechnology,
    title: "Advanced Technology",
    description:
      "Advanced technology delivering effective results with minimal downtime.",
  },
] as const;

export function BookingLeftPanel() {
  return (
    <div className="flex w-full shrink-0 flex-col justify-between gap-4 lg:min-h-0 lg:flex-1 lg:shrink lg:gap-6">
      <div className="flex shrink-0 flex-col gap-3 lg:gap-5">
        <h1 className="font-display text-[28px] leading-tight font-normal text-[#185b50] lg:text-[40px] xl:text-[48px]">
          Book An Appointment
        </h1>
        <p className="text-sm leading-[1.5] text-[#222] lg:text-base">
          Schedule your consultation with our experts and take the first step
          towards healthier skin, hair, wellness, and weight management.
        </p>
      </div>

      <div className="hidden shrink-0 flex-col items-start gap-4 lg:flex lg:gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="flex w-full items-center gap-4 lg:gap-5"
          >
            <div className="relative size-10 shrink-0 overflow-hidden lg:size-[50px]">
              <Image
                src={feature.icon}
                alt=""
                fill
                className="object-contain"
                sizes="50px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1 lg:gap-2.5">
              <h2 className="font-display text-lg leading-tight font-normal text-[#185b50] lg:text-2xl">
                {feature.title}
              </h2>
              <p className="text-sm leading-[1.4] text-[#222] lg:text-base lg:leading-[1.5]">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative hidden min-h-[100px] w-full flex-1 overflow-hidden rounded-[30px] bg-white lg:block">
        <div className="absolute top-1/2 left-0 aspect-[870/460] w-[126.09%] -translate-y-1/2">
          <Image
            src={bookingAssets.heroImage}
            alt="Consultation at NovaThera"
            fill
            className="pointer-events-none object-cover"
            sizes="(max-width: 1024px) 100vw, 600px"
          />
        </div>
      </div>
    </div>
  );
}
