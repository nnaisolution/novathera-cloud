"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { accountNavItems } from "../utils/account-nav-items";

export function AccountSidebarNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account"
      className="sticky top-[150px] flex w-full max-w-[385px] shrink-0 flex-col items-start gap-2.5 rounded-[20px] bg-white p-[30px]"
    >
      {accountNavItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex w-full items-center justify-between gap-2.5 rounded-2xl px-[30px] py-4 text-lg transition-colors",
              isActive
                ? "bg-[#185b50] text-white"
                : "text-[#185b50] hover:bg-[#185b50]/5",
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-6" aria-hidden />
              {item.label}
            </span>
            {isActive ? <ArrowUpRight className="size-6" aria-hidden /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
