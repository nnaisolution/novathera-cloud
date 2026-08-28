import { aboutStats } from "@/components/features/about-us/about-us-data";
import { cn } from "@/lib/utils";

type AboutStatsSectionProps = {
  className?: string;
};

export function AboutStatsSection({ className }: AboutStatsSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 py-16 lg:px-[200px] lg:py-20",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
        {aboutStats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 pb-5">
            <p className="font-display text-5xl leading-[72px] tracking-[-0.72px] text-[#d79628] lg:text-[72px]">
              {stat.value}
            </p>
            <p className="text-base tracking-[2.1px] text-[#546256] uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
