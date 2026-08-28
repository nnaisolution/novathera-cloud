import Image from "next/image";

import { cn } from "@/lib/utils";

type AboutTeamCardProps = {
  name: string;
  role: string;
  bio: string;
  image: string;
  className?: string;
};

export function AboutTeamCard({
  name,
  role,
  bio,
  image,
  className,
}: AboutTeamCardProps) {
  return (
    <article
      className={cn(
        "flex min-w-[260px] flex-1 flex-col overflow-hidden rounded-[28px] border border-[#d8d8cd] bg-[#faf7ee]",
        className,
      )}
    >
      <div className="relative h-[375px] w-full shrink-0">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 1024px) 80vw, 25vw"
        />
      </div>
      <div className="flex flex-col gap-1 p-6">
        <h3 className="font-display text-xl leading-7 tracking-[-0.2px] text-[#0c1f13]">
          {name}
        </h3>
        <p className="text-xs tracking-[2.4px] text-[#d79628] uppercase">
          {role}
        </p>
        <p className="pt-1.5 text-base leading-[1.5] text-[#546256]">{bio}</p>
      </div>
    </article>
  );
}
