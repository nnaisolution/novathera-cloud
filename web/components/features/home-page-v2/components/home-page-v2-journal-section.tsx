import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { HomePageV2JournalArticleCard } from "@/components/features/home-page-v2/components/home-page-v2-journal-article-card";
import { homePageV2JournalArticles } from "@/components/features/home-page-v2/home-page-v2-journal-data";
import { siteNavigation } from "@/components/shared/site-navigation";
import { cn } from "@/lib/utils";

type HomePageV2JournalSectionProps = {
  className?: string;
};

export function HomePageV2JournalSection({
  className,
}: HomePageV2JournalSectionProps) {
  return (
    <section
      className={cn(
        "bg-[rgba(229,235,216,0.4)] px-6 pt-[50px] pb-[100px] lg:px-[200px]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-14">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="text-sm tracking-[2px] text-[#546256] uppercase">
              The journal
            </p>
            <h2 className="font-display text-4xl text-[#0c1f13] sm:text-5xl lg:text-[60px]">
              <span>Recent </span>
              <span className="text-[#bf913d]">reading</span>
            </h2>
          </div>

          <Link
            href={siteNavigation.comingSoon}
            className="inline-flex items-baseline gap-2 font-display text-2xl tracking-[-0.24px] text-[#0c1f13] transition-opacity hover:opacity-70"
          >
            All articles
            <ArrowRight className="size-6" aria-hidden />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {homePageV2JournalArticles.map((article) => (
            <HomePageV2JournalArticleCard
              key={article.id}
              article={article}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
