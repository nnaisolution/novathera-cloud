import { homePageV2TextBarCategories } from "@/components/features/home-page-v2/home-page-v2-text-bar-data";
import { cn } from "@/lib/utils";

type HomePageV2TextBarSectionProps = {
  className?: string;
};

function TextBarItem({ label }: { label: string }) {
  return (
    <div className="flex shrink-0 items-center gap-8 self-stretch pb-px">
      <span className="font-display text-2xl tracking-[-0.24px] whitespace-nowrap text-[rgba(12,31,19,0.7)]">
        {label}
      </span>
      <span
        className="size-1.5 shrink-0 rounded-full bg-[#bf913d]"
        aria-hidden
      />
    </div>
  );
}

function TextBarTrack() {
  return (
    <div className="flex shrink-0 items-center gap-12 py-5">
      {homePageV2TextBarCategories.map((label) => (
        <TextBarItem key={label} label={label} />
      ))}
    </div>
  );
}

export function HomePageV2TextBarSection({
  className,
}: HomePageV2TextBarSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden border-y border-[#d8d8cd] bg-[#e5ebd8]",
        className,
      )}
      aria-label="Service categories"
    >
      <div className="home-page-v2-text-bar-marquee flex w-max">
        <TextBarTrack />
        <TextBarTrack aria-hidden />
      </div>
    </section>
  );
}
