"use client";

import { usePathname } from "next/navigation";

import { SiteHeader } from "@/components/shared/site-header";
import { siteNavigation } from "@/components/shared/site-navigation";

function getActiveNavItem(pathname: string) {
  if (pathname.startsWith(siteNavigation.shop)) return "Shop" as const;
  if (pathname === siteNavigation.aboutUs) return "About" as const;
  if (pathname === siteNavigation.career) return "Career" as const;
  if (pathname === siteNavigation.contact) return "Contact" as const;
  // if (pathname === siteNavigation.blog) return "Blog" as const;
  return undefined;
}

export function SiteHeaderShell() {
  const pathname = usePathname();

  if (
    pathname === siteNavigation.home ||
    pathname === siteNavigation.aboutUs ||
    pathname === siteNavigation.contact ||
    pathname === siteNavigation.career ||
    pathname.startsWith(siteNavigation.shop) ||
    pathname.startsWith("/services") ||
    pathname.startsWith("/book") ||
    pathname.startsWith("/account") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email"
  ) {
    return null;
  }

  const activeItem = getActiveNavItem(pathname);

  return (
    <div className="fixed inset-x-0 top-0 z-50 pt-4 lg:pt-[50px]">
      <div className="container mx-auto">
        <SiteHeader activeItem={activeItem} />
      </div>
    </div>
  );
}
