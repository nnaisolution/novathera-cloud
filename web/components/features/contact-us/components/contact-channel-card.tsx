import Link from "next/link";

import { cn } from "@/lib/utils";

type ContactChannelCardProps = {
  icon: string;
  label: string;
  lines: readonly string[];
  href: string;
  className?: string;
};

export function ContactChannelCard({
  icon,
  label,
  lines,
  href,
  className,
}: ContactChannelCardProps) {
  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      className={cn(
        "flex w-full flex-col rounded-[28px] border border-[#d79628] bg-[rgba(229,235,216,0.4)] p-8 transition-opacity hover:opacity-90 lg:p-10",
        className,
      )}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <p className="text-[30px] leading-9 text-[#d79628]" aria-hidden>
        {icon}
      </p>
      <p className="pt-5 text-xs tracking-[2.4px] text-[#546256] uppercase">
        {label}
      </p>
      <div className="flex flex-col pt-3">
        {lines.map((line) => (
          <p
            key={line}
            className="font-display text-xl leading-7 tracking-[-0.2px] text-[#0c1f13]"
          >
            {line}
          </p>
        ))}
      </div>
    </Link>
  );
}
