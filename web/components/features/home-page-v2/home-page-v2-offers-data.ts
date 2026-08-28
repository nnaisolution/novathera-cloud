import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { siteNavigation } from "@/components/shared/site-navigation";

export type HomePageV2OfferCard = {
  id: string;
  headline: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  backgroundClassName: string;
  imageClassName?: string;
};

export const homePageV2OfferCards: HomePageV2OfferCard[] = [
  {
    id: "first-ritual",
    headline: "15%",
    title: "off your first ritual",
    description:
      "New members enjoy a complimentary diagnostic with any treatment.",
    ctaLabel: "Join Waitlist",
    ctaHref: siteNavigation.waitlist,
    image: homePageV2Assets.offers.serum,
    imageAlt: "Nova Thera skincare products",
    backgroundClassName: "bg-[rgba(213,175,145,0.4)]",
  },
  {
    id: "expert-consultation",
    headline: "Free",
    title: "Expert Consultation",
    description:
      "30 minutes with one of our practitioners — fully complimentary.",
    ctaLabel: "Book now",
    ctaHref: siteNavigation.book,
    image: homePageV2Assets.offers.consultation,
    imageAlt: "Client consultation",
    backgroundClassName: "bg-[#b1cfa1]",
    imageClassName: "object-cover object-[center_20%]",
  },
];
