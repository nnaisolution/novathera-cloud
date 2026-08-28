import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { siteNavigation } from "@/components/shared/site-navigation";

export type HomePageV2JournalArticle = {
  id: string;
  category: string;
  title: string;
  image: string;
  href: string;
};

export const homePageV2JournalArticles: HomePageV2JournalArticle[] = [
  {
    id: "morning-rituals",
    category: "Skincare",
    title: "Seven gentle morning rituals for glowing, resilient skin",
    image: homePageV2Assets.journal.morningRituals,
    href: siteNavigation.comingSoon,
  },
  {
    id: "adaptogens-stress",
    category: "Wellness",
    title: "How adaptogens quietly rewire your stress response",
    image: homePageV2Assets.journal.adaptogensStress,
    href: siteNavigation.comingSoon,
  },
  {
    id: "skin-barrier",
    category: "Science",
    title: "Understanding your skin barrier — and how to feed it",
    image: homePageV2Assets.journal.skinBarrier,
    href: siteNavigation.comingSoon,
  },
];
