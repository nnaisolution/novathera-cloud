import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { homePageV2Assets } from "@/components/features/home-page-v2/assets";
import { homePageV2NavItems } from "@/components/features/home-page-v2/home-page-v2-nav";
import { UserAccountMenu } from "@/components/shared/user-account-menu";
import { siteNavigation } from "@/components/shared/site-navigation";

export function AccountHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-[120px] w-full items-center justify-between bg-[#185b50] px-6 shadow-[0px_4px_5px_rgba(0,0,0,0.1)] lg:px-[200px]">
      <Link href={siteNavigation.home} className="block h-[70px] w-[220px] shrink-0 lg:w-[288px]">
        <Image
          src={homePageV2Assets.header.logo}
          alt="Nova Thera"
          width={288}
          height={70}
          className="h-full w-full object-contain object-left"
          priority
        />
      </Link>

      <nav
        aria-label="Primary"
        className="hidden min-w-0 flex-1 items-center justify-center gap-6 overflow-x-auto px-6 text-[15px] text-white [-ms-overflow-style:none] scrollbar-none xl:flex [&::-webkit-scrollbar]:hidden"
      >
        {homePageV2NavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="whitespace-nowrap transition-opacity hover:opacity-70"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-4">
        <Link
          href={siteNavigation.book}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-medium text-[#185b50] transition-opacity hover:opacity-90"
        >
          Book A Visit
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>

        <UserAccountMenu variant="dark" />
      </div>
    </header>
  );
}
