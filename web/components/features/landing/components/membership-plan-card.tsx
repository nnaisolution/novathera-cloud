import { Check } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MembershipPlan = {
  tagline: string;
  title: string;
  description: string;
  features: readonly string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
};

export function MembershipPlanCard({
  tagline,
  title,
  description,
  features,
  ctaLabel,
  ctaHref,
  featured = false,
}: MembershipPlan) {
  return (
    <Card
      className={cn(
        "flex w-full max-w-[385px] flex-col justify-between gap-0 rounded-[30px] border-0 bg-[#013338] py-0 text-white ring-0",
        featured
          ? "max-w-[450px] border border-white/60 lg:min-h-[650px]"
          : "lg:min-h-[573px]",
      )}
    >
      <CardHeader className="gap-[30px] px-10 pt-10 pb-0">
        <p className="text-xl leading-normal font-semibold text-white">
          {tagline}
        </p>
        <div className="flex flex-col gap-2.5">
          <h3 className="font-display text-[32px] leading-normal text-white">
            {title}
          </h3>
          <p className="text-base leading-normal text-white">{description}</p>
        </div>
      </CardHeader>

      <CardContent className="px-10 pt-[30px]">
        <ul className="flex flex-col gap-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white">
                <Check
                  className="size-4 text-[#013338]"
                  strokeWidth={2.5}
                  aria-hidden
                />
              </span>
              <span className="text-base leading-normal text-white">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="border-0 bg-transparent px-10 pt-10 pb-10">
        <Link
          href={ctaHref}
          className={buttonVariants({
            className: cn(
              "h-auto w-full rounded-2xl px-[30px] py-4 text-base font-normal tracking-wide uppercase",
              featured
                ? "bg-white !text-black hover:bg-white/90 hover:!text-white"
                : "border border-white bg-transparent text-white hover:bg-white/10",
            ),
          })}
        >
          {ctaLabel}
        </Link>
      </CardFooter>
    </Card>
  );
}
