import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { siteNavigation } from "@/components/shared/site-navigation";

type BookingBackButtonProps = {
  href?: string;
};

export function BookingBackButton({
  href = siteNavigation.home,
}: BookingBackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-[50px] w-fit items-center gap-1.5 rounded-[16px] bg-[#f3f3f3] px-4 py-2.5 text-base leading-[1.5] text-[#222] transition-colors hover:bg-[#ebebeb]"
    >
      <ArrowLeft className="size-6" strokeWidth={1.5} aria-hidden />
      Back
    </Link>
  );
}
