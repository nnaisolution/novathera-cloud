import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type CareerWhyJoinCardProps = {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
};

export function CareerWhyJoinCard({
  icon: Icon,
  iconClassName,
  title,
  description,
}: CareerWhyJoinCardProps) {
  return (
    <article className="flex h-full w-full flex-col items-center gap-10 rounded-[16px] bg-[#fffaf0] px-5 py-10 text-center">
      <div className="flex size-[100px] shrink-0 items-center justify-center rounded-full bg-white">
        <Icon
          className={cn("size-10 text-[#023a40]", iconClassName)}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      <div className="flex w-full max-w-[287px] flex-col items-center gap-2.5">
        <h3 className="font-display w-full text-2xl leading-normal text-[#023a40]">
          {title}
        </h3>
        <p className="w-full text-base leading-[1.5] text-[#222]">
          {description}
        </p>
      </div>
    </article>
  );
}
