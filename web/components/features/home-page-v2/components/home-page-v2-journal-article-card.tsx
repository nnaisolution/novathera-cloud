import Image from "next/image";
import Link from "next/link";

import type { HomePageV2JournalArticle } from "@/components/features/home-page-v2/home-page-v2-journal-data";
import { cn } from "@/lib/utils";

type HomePageV2JournalArticleCardProps = {
  article: HomePageV2JournalArticle;
  className?: string;
};

export function HomePageV2JournalArticleCard({
  article,
  className,
}: HomePageV2JournalArticleCardProps) {
  return (
    <article className={cn("flex flex-col gap-5", className)}>
      <Link
        href={article.href}
        className="group relative block aspect-410/513 w-full overflow-hidden rounded-[28px]"
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 410px"
        />
      </Link>

      <div className="flex flex-col gap-2.5 pt-1">
        <p className="text-sm tracking-[1px] text-[#546256] uppercase">
          {article.category}
        </p>
        <h3 className="font-display text-2xl tracking-[-0.24px] text-[#0c1f13]">
          <Link
            href={article.href}
            className="transition-opacity hover:opacity-70"
          >
            {article.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
