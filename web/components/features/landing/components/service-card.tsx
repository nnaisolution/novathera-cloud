import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export type ServiceTitle = string | readonly string[];

export type ServiceCardData = {
  title: ServiceTitle;
  image: string;
};

export function getServiceTitle(title: ServiceTitle): string {
  if (typeof title === "string") return title;
  return title.join(" ");
}

type ServiceCardProps = ServiceCardData & {
  className?: string;
  heightClass?: string;
  titleClassName?: string;
};

export function ServiceCard({
  title,
  image,
  className,
  heightClass = "h-[520px]",
  titleClassName,
}: ServiceCardProps) {
  const label = getServiceTitle(title);

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col justify-between overflow-hidden rounded-[20px] bg-[#edffe3] p-5",
        heightClass,
        className,
      )}
    >
      <div className="flex items-start gap-2.5 px-2.5 pt-2.5">
        <h3
          className={cn(
            "font-display flex-1 text-left text-[28px] leading-normal text-[#023a40]",
            titleClassName,
          )}
        >
          {typeof title === "string"
            ? title
            : title.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
        </h3>
        <ArrowUpRight
          className="size-8 shrink-0 text-[#023a40]"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>

      <div className="relative h-[379px] w-full shrink-0 overflow-hidden rounded-[10px] bg-white">
        <Image
          src={image}
          alt={label}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 385px"
        />
      </div>
    </article>
  );
}
