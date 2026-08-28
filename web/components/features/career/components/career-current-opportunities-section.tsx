import Link from "next/link";

import { CareerOpeningCard } from "@/components/features/career/components/career-opening-card";
import { siteNavigation } from "@/components/shared/site-navigation";
import { buttonVariants } from "@/components/ui/button";

const DEFAULT_LOCATION = "Vaughan, Ontario";
const DEFAULT_SALARY = "$2.4k - $3k";
const DEFAULT_EMPLOYMENT_TYPE = "Full Time";

const openings: ReadonlyArray<{
  title: string;
  description: string;
}> = [
  {
    title: "Skincare Specialist",
    description:
      "We are looking for a skilled skincare specialist passionate about client care and advanced skin treatments.",
  },
  {
    title: "Hair Treatment Expert",
    description:
      "Join our team to deliver personalized hair and scalp treatments focused on real, visible results.",
  },
  {
    title: "Wellness Consultant",
    description:
      "Help clients choose the right wellness and weight management programs tailored to their goals.",
  },
  {
    title: "Digital Marketing Executive",
    description:
      "Seeking a creative marketer to manage campaigns, social media, and brand communication for Nova Thera.",
  },
  {
    title: "Front Desk Executive",
    description:
      "Be the first point of contact for clients while ensuring a smooth and welcoming experience.",
  },
  {
    title: "Nutrition & Diet Consultant",
    description:
      "We are looking for a knowledgeable nutrition consultant to guide clients with personalized diet and wellness plans supporting their health and weight management goals.",
  },
];

export function CareerCurrentOpportunitiesSection() {
  return (
    <section className="bg-white px-6 pt-16 pb-20 md:px-12 lg:px-[160px] lg:pt-[60px] lg:pb-[120px]">
      <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-10 lg:gap-[60px]">
        <h2 className="font-display text-center text-4xl text-[#023a40] md:text-5xl lg:text-[60px] lg:leading-tight">
          Current Opportunities
        </h2>

        <div className="grid w-full grid-cols-1 gap-[30px] lg:grid-cols-2">
          {openings.map((opening) => (
            <CareerOpeningCard
              key={opening.title}
              title={opening.title}
              description={opening.description}
              employmentType={DEFAULT_EMPLOYMENT_TYPE}
              location={DEFAULT_LOCATION}
              salary={DEFAULT_SALARY}
            />
          ))}
        </div>

        <Link
          href={siteNavigation.comingSoon}
          className={buttonVariants({
            className:
              "h-[51px] w-[230px] rounded-2xl bg-[#023a40] px-[30px] text-base font-normal tracking-wide text-white uppercase hover:bg-[#023a40]/90",
          })}
        >
          View all openings
        </Link>
      </div>
    </section>
  );
}
