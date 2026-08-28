"use client";

import {
  ArrowRight,
  CalendarDays,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { homePageV2NavItems } from "@/components/features/home-page-v2/home-page-v2-nav";
import { useCart } from "@/components/features/shop/hooks/use-cart";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";
import { siteNavigation } from "@/components/shared/site-navigation";
import {
  Sheet,
  SheetDescription,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const rowClass =
  "flex items-center gap-2.5 border-b border-[#d8d8cd] py-3.5 text-[17px] text-[#0c1f13] transition-opacity hover:opacity-70";
const iconClass = "size-[18px] shrink-0 text-[#185b50]";

type HomePageV2MobileMenuProps = {
  variant?: "overlay" | "sticky";
};

export function HomePageV2MobileMenu({
  variant = "overlay",
}: HomePageV2MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const cartQuery = useCart(Boolean(session?.user));
  const cartCount =
    cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80 xl:hidden",
          variant === "sticky"
            ? "bg-[#185b50]/10 text-[#185b50]"
            : "bg-white/15 text-white",
        )}
      >
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>

      <SheetPopup side="right" className="gap-6 bg-[#faf7ee]">
        <SheetTitle className="font-display text-2xl font-normal text-[#185b50]">
          Menu
        </SheetTitle>
        <SheetDescription className="sr-only">
          Site navigation and account links
        </SheetDescription>

        <nav aria-label="Mobile" className="flex flex-col">
          {homePageV2NavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={close}
              className={rowClass}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col">
          <Link href={shopRoutes.cart} onClick={close} className={rowClass}>
            <ShoppingBag className={iconClass} aria-hidden />
            Cart
            {cartCount > 0 ? (
              <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-[#185b50] text-xs font-medium text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/account/appointments/upcoming"
                onClick={close}
                className={rowClass}
              >
                <CalendarDays className={iconClass} aria-hidden />
                My bookings
              </Link>
              <Link
                href="/account/orders"
                onClick={close}
                className={rowClass}
              >
                <Package className={iconClass} aria-hidden />
                Orders
              </Link>
              <button
                type="button"
                onClick={() => {
                  close();
                  void authClient.signOut();
                }}
                className={cn(rowClass, "text-left")}
              >
                <LogOut className={iconClass} aria-hidden />
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={close} className={rowClass}>
              Sign in
            </Link>
          )}
        </div>

        <Link
          href={siteNavigation.book}
          onClick={close}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#185b50] px-6 py-3.5 text-base font-medium text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90"
        >
          Book A Visit
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </SheetPopup>
    </Sheet>
  );
}
