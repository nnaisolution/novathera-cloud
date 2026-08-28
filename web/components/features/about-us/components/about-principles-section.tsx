import { AboutPrincipleCard } from "@/components/features/about-us/components/about-principle-card";
import { aboutPrinciples } from "@/components/features/about-us/about-us-data";
import { cn } from "@/lib/utils";

type AboutPrinciplesSectionProps = {
  className?: string;
};

export function AboutPrinciplesSection({
  className,
}: AboutPrinciplesSectionProps) {
  return (
    <section
      className={cn(
        "bg-[rgba(229,235,216,0.4)] px-6 pt-24 pb-20 lg:px-[200px] lg:pt-32 lg:pb-24",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-16">
        <div className="flex max-w-[672px] flex-col items-center gap-[18.5px] text-center">
          <p className="text-base tracking-[0.8px] text-[#d79628] uppercase">
            What we believe
          </p>
          <h2 className="font-display text-4xl tracking-[-0.6px] text-[#0c1f13] sm:text-[48px] sm:leading-[60px]">
            <span className="block">Principles that guide</span>
            <span className="block">
              <span className="text-[#d79628]">everything</span> we do
            </span>
          </h2>
        </div>

        <div className="grid w-full grid-cols-1 overflow-hidden rounded-[28px] border border-[#d8d8cd] bg-[#d8d8cd] gap-px sm:grid-cols-2 xl:grid-cols-4">
          {aboutPrinciples.map((principle) => (
            <AboutPrincipleCard
              key={principle.number}
              number={principle.number}
              title={principle.title}
              description={principle.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
