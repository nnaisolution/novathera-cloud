import { landingAssets } from "@/components/features/landing/assets";
import { PromoCard } from "@/components/features/landing/components/promo-card";

export function PromoGridSection() {
  return (
    <section className="bg-[#f2f2f2] pt-20 pb-20 lg:pt-[160px] lg:pb-20">
      <div className="mx-auto flex max-w-[1920px] flex-col gap-[60px] lg:flex-row lg:items-center">
        <PromoCard
          image={landingAssets.promo.essentials}
          eyebrow="coming soon"
          title="Nova Thera Essentials"
          description="Thoughtfully curated wellness and skincare essentials designed to support your treatment journey beyond the clinic."
          cta="join waitlist"
          opensWaitlist
          narrowCta
          className="min-h-[min(520px,80vw)] w-full lg:min-h-[960px] lg:flex-1 lg:rounded-tr-[30px] lg:rounded-br-[30px]"
          imageSizes="(max-width: 1024px) 100vw, 50vw"
        />

        <div className="flex w-full flex-col gap-[60px] lg:w-[930px] lg:max-w-[calc(50%-30px)] lg:shrink-0">
          <PromoCard
            image={landingAssets.promo.memberships}
            eyebrow="personalized care"
            title="Wellness Memberships"
            description="Flexible wellness programs designed for recovery, skin optimization, longevity, and ongoing self-care."
            cta="Explore Programs"
            className="min-h-[450px] w-full rounded-tl-[30px] rounded-bl-[30px]"
            imageSizes="(max-width: 1024px) 100vw, 45vw"
          />
          <PromoCard
            image={landingAssets.promo.transformation}
            title={["Begin Your Wellness", "Transformation"]}
            cta="Join the waitlist"
            opensWaitlist
            dark
            className="min-h-[450px] w-full rounded-tl-[30px] rounded-bl-[30px]"
            imageSizes="(max-width: 1024px) 100vw, 45vw"
          />
        </div>
      </div>
    </section>
  );
}
