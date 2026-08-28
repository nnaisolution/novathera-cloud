import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type AboutPrincipleCardProps = {
  number: string;
  title: string;
  description: string;
  className?: string;
};

export function AboutPrincipleCard({
  number,
  title,
  description,
  className,
}: AboutPrincipleCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col gap-6 bg-[#faf7ee] p-8 lg:p-10",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="font-display text-[30px] leading-9 tracking-[-0.3px] text-[#bf913d]">
          {number}
        </p>
        <span
          className="flex size-10 items-center justify-center rounded-full border border-[#d8d8cd] text-[rgba(12,31,19,0.6)]"
          aria-hidden
        >
          <ArrowRight className="size-4" />
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-3">
        <h3 className="font-display text-2xl text-[#0c1f13]">{title}</h3>
        <p className="text-base leading-6 text-[#546256]">{description}</p>
      </div>
    </div>
  );
}
