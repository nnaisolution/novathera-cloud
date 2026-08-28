import Image from "next/image";

import { landingAssets } from "@/components/features/landing/assets";
import { WaitlistTrigger } from "@/components/shared/waitlist-trigger";
import { buttonVariants } from "@/components/ui/button";

export function BrandSection() {
  // Testimonials carousel — re-enable from git history when ready
  return (
    <section className="relative bg-white">
      <div className="relative mx-auto min-h-[520px] w-full lg:min-h-[720px]">
        <div className="absolute inset-0">
          <Image
            src={landingAssets.testimonialsBackground}
            alt=""
            fill
            className="object-cover object-top"
            sizes="100vw"
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(392px,33vh)] bg-gradient-to-b from-white to-transparent" />

        <div className="absolute inset-x-0 bottom-0 z-20 px-6 py-20 lg:py-28">
          <div className="container mx-auto grid gap-10 lg:grid-cols-2 lg:items-end">
            <h2 className="font-display max-w-md text-4xl leading-tight text-[#023a40] md:text-5xl lg:text-[60px]">
              Redefine the
              <br />
              Way You Feel
            </h2>
            <div className="flex max-w-[385px] flex-col gap-[30px] lg:ml-auto">
              <p className="text-base leading-normal text-[#222]">
                Nova Thera is a modern wellness and aesthetic destination that
                blends advanced science with personalized care to deliver real,
                lasting results.
              </p>
              <WaitlistTrigger
                className={buttonVariants({
                  className:
                    "h-auto w-fit rounded-2xl bg-white px-[30px] py-4 text-base font-normal tracking-wide !text-black uppercase hover:bg-white/90 hover:!text-white",
                })}
              >
                Join the waitlist
              </WaitlistTrigger>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
