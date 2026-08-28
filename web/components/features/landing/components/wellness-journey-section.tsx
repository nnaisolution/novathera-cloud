import Image from "next/image";

import { landingAssets } from "@/components/features/landing/assets";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "STEP 1",
    title: "Consultation",
    description: "Personal wellness assessment with licensed specialists",
    icon: landingAssets.stepIcons.consultation,
  },
  {
    step: "STEP 2",
    title: "Bioenergetic Scan",
    description: "AI-supported diagnostics and wellness insights",
    icon: landingAssets.stepIcons.scan,
  },
  {
    step: "STEP 3",
    title: "Personalized Protocol",
    description: "Custom treatment plan based on your goals",
    icon: landingAssets.stepIcons.protocol,
  },
  {
    step: "STEP 4",
    title: "Ongoing Optimization",
    description: "Track recovery, wellness, and performance over time",
    icon: landingAssets.stepIcons.optimization,
  },
] as const;

function StepCard({ step, title, description, icon }: (typeof steps)[number]) {
  return (
    <Card className="flex h-[400px] w-full max-w-[327px] shrink-0 flex-col justify-between rounded-2xl border-0 bg-[#fffaf0] px-5 py-10 shadow-none">
      <CardContent className="flex h-full flex-col items-center justify-between gap-0 p-0">
        <div className="flex size-[100px] shrink-0 items-center justify-center rounded-full bg-white">
          <Image src={icon} alt="" width={50} height={50} />
        </div>
        <div className="flex w-full max-w-[287px] flex-col items-center gap-2.5">
          <Badge className="rounded-full bg-[#023a40] px-4 py-1.5 text-sm font-normal text-white hover:bg-[#023a40]">
            {step}
          </Badge>
          <h3 className="font-display text-center text-2xl text-[#023a40]">
            {title}
          </h3>
          <p className="text-center text-base leading-normal text-[#222]">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function WellnessJourneySection() {
  const topSteps = steps.slice(0, 2);
  const bottomSteps = steps.slice(2, 4);

  return (
    <section className="relative overflow-hidden bg-[#f2f2ef] px-6 py-20 md:px-12 lg:px-[160px] lg:pt-[160px] lg:pb-20">
      <h2 className="font-display relative z-10 mx-auto mb-[60px] max-w-3xl text-center text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
        Your Personalized
        <br />
        Wellness Journey
      </h2>

      <div className="relative mx-auto w-full max-w-[1600px]">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-[1032/1060] w-full max-w-[min(600px,92vw)] -translate-x-1/2 -translate-y-1/2 bg-contain bg-center bg-no-repeat lg:max-w-[800px]"
          style={{
            backgroundImage: `url(${landingAssets.wellnessJourneyCenter})`,
          }}
          aria-hidden
        />

        <div className="relative z-10 flex flex-col gap-16 lg:gap-[350px]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {topSteps.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>

          <div
            className={cn(
              "flex flex-col gap-5 sm:flex-row sm:items-center",
              "sm:justify-end",
            )}
          >
            {bottomSteps.map((step) => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </div>
      </div>

      <Image
        src={landingAssets.journeyLeafDecor}
        alt=""
        width={351}
        height={351}
        className="pointer-events-none absolute -bottom-10 -left-24 hidden opacity-90 lg:block"
      />
    </section>
  );
}
