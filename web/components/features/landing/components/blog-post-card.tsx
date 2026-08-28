import { Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BlogPostCardData = {
  title: string;
  excerpt: string;
  date: string;
  image: string;
  href?: string;
};

type BlogPostCardProps = BlogPostCardData & {
  className?: string;
};

export function BlogPostCard({
  title,
  excerpt,
  date,
  image,
  href = siteNavigation.comingSoon,
  className,
}: BlogPostCardProps) {
  return (
    <article
      className={cn(
        "flex w-full max-w-[385px] flex-col gap-5",
        className,
      )}
    >
      <Link href={href} className="group block w-full">
        <div className="relative h-[240px] w-full overflow-hidden rounded-[20px] bg-white">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 385px"
          />
        </div>
      </Link>

      <Badge
        variant="secondary"
        className="h-auto gap-1.5 rounded-[10px] border-0 bg-[#edffe3] px-2.5 py-1.5 text-base font-normal text-[#222] hover:bg-[#edffe3]"
      >
        <Calendar className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
        {date}
      </Badge>

      <div className="flex flex-col gap-2.5">
        <Link href={href}>
          <h3 className="font-display line-clamp-2 text-[28px] leading-normal text-[#023a40]">
            {title}
          </h3>
        </Link>
        <p className="line-clamp-2 text-base leading-normal text-[#222]">
          {excerpt}
        </p>
      </div>
    </article>
  );
}
