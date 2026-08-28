import {
  Briefcase,
  type LucideIcon,
  Puzzle,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { CareerWhyJoinCard } from "@/components/features/career/components/career-why-join-card";
import { siteNavigation } from "@/components/shared/site-navigation";
import { buttonVariants } from "@/components/ui/button";

const cards: ReadonlyArray<{
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  description: string;
}> = [
  {
    icon: TrendingUp,
    title: "Growth Opportunities",
    description:
      "Learn, grow, and advance your career with continuous development opportunities.",
  },
  {
    icon: Users,
    iconClassName: "size-[50px]",
    title: "Positive Work Culture",
    description:
      "Work in a supportive and collaborative environment that values teamwork and innovation.",
  },
  {
    icon: Puzzle,
    title: "Make a Real Impact",
    description:
      "Help clients feel more confident and healthier through meaningful care and services.",
  },
  {
    icon: Briefcase,
    title: "Professional Environment",
    description:
      "Be part of a workplace focused on excellence, innovation, and high-quality experiences.",
  },
];

export function CareerWhyJoinSection() {
  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-[160px] lg:py-[120px]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-12 lg:flex-row lg:items-start lg:gap-[60px]">
        <div className="flex w-full flex-col gap-10 lg:w-[568px] lg:shrink-0 lg:justify-center">
          <div className="flex flex-col gap-5">
            <h2 className="font-display text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
              Why Join
              <br />
              Nova Thera
            </h2>
            <p className="max-w-xl text-base leading-[1.5] text-[#222]">
              We&apos;re here to answer your questions and help you find the
              right wellness solutions tailored to your needs.
            </p>
          </div>

          <Link
            href={siteNavigation.comingSoon}
            className={buttonVariants({
              className:
                "h-[51px] w-[230px] rounded-2xl bg-[#023a40] px-[30px] text-base font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90",
            })}
          >
            Apply Now
          </Link>
        </div>

        <div className="grid w-full grid-cols-1 gap-[30px] sm:grid-cols-2 lg:flex-1">
          {cards.map((card) => (
            <CareerWhyJoinCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
