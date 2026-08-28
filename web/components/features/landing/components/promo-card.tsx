"use client";

import Image from "next/image";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import { WaitlistTrigger } from "@/components/shared/waitlist-trigger";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type PromoCardProps = {
  image: string;
  eyebrow?: string;
  title: string | readonly string[];
  description?: string;
  cta: string;
  ctaHref?: string;
  opensWaitlist?: boolean;
  dark?: boolean;
  narrowCta?: boolean;
  className?: string;
  imageSizes?: string;
};

const ctaClassName = (narrowCta: boolean) =>
  cn(
    "h-auto rounded-2xl bg-white px-[30px] py-4 text-base font-normal tracking-wide !text-black uppercase hover:bg-white/90 hover:!text-white",
    narrowCta ? "w-[170px]" : "w-fit min-w-[196px]",
  );

export function PromoCard({
  image,
  eyebrow,
  title,
  description,
  cta,
  ctaHref = siteNavigation.comingSoon,
  opensWaitlist = false,
  dark = false,
  narrowCta = false,
  className,
  imageSizes = "50vw",
}: PromoCardProps) {
  const titleLines = typeof title === "string" ? [title] : title;

  const ctaButton = opensWaitlist ? (
    <WaitlistTrigger
      className={buttonVariants({
        className: ctaClassName(narrowCta),
      })}
    >
      {cta}
    </WaitlistTrigger>
  ) : (
    <Link
      href={ctaHref}
      className={buttonVariants({
        className: ctaClassName(narrowCta),
      })}
    >
      {cta}
    </Link>
  );

  return (
    <Card
      className={cn(
        "relative gap-0 overflow-hidden rounded-none border-0 bg-[#ebebeb] py-0 ring-0",
        className,
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        sizes={imageSizes}
      />
      {dark ? (
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-transparent" />
      ) : null}

      <div className="relative z-10 flex flex-col gap-[30px] p-8 md:p-[60px] lg:max-w-lg">
        <div className="flex flex-col gap-2.5">
          {eyebrow ? (
            <p
              className={cn(
                "text-xl leading-normal uppercase",
                dark ? "text-white/90" : "text-[#222]",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h3
            className={cn(
              "font-display text-3xl leading-tight md:text-4xl lg:text-[48px]",
              dark ? "text-white" : "text-[#023a40]",
            )}
          >
            {titleLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h3>
          {description ? (
            <p
              className={cn(
                "text-base leading-normal",
                dark ? "text-white/90" : "text-[#222]",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>

        {ctaButton}
      </div>
    </Card>
  );
}
