import { AboutTeamCard } from "@/components/features/about-us/components/about-team-card";
import { aboutTeamMembers } from "@/components/features/about-us/about-us-data";
import { cn } from "@/lib/utils";

type AboutTeamSectionProps = {
  className?: string;
};

export function AboutTeamSection({ className }: AboutTeamSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 pt-20 pb-16 lg:px-[200px] lg:pt-28 lg:pb-24",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-[18.5px]">
            <p className="text-base tracking-[0.8px] text-[#d79628] uppercase">
              The practitioners
            </p>
            <h2 className="font-display text-4xl tracking-[-0.6px] text-[#0c1f13] sm:text-[48px] sm:leading-[60px]">
              Meet our team
            </h2>
          </div>
          <p className="max-w-[448px] text-base leading-[1.5] text-[#546256]">
            Every practitioner is board-certified, continuously trained, and
            selected as much for their empathy as their expertise.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-none lg:overflow-visible [&::-webkit-scrollbar]:hidden">
          {aboutTeamMembers.map((member) => (
            <AboutTeamCard
              key={member.id}
              name={member.name}
              role={member.role}
              bio={member.bio}
              image={member.image}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
