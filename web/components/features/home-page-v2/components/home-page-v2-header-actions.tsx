"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { shopAssets } from "@/components/features/shop/assets";
import { useCart } from "@/components/features/shop/hooks/use-cart";
import { shopRoutes } from "@/components/features/shop/utils/shop-routes";
import { siteNavigation } from "@/components/shared/site-navigation";
import { UserAccountMenu } from "@/components/shared/user-account-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type HomePageV2HeaderActionsProps = {
  variant?: "overlay" | "sticky";
};

function CartBadge({ variant }: { variant: "overlay" | "sticky" }) {
  const { data: session } = authClient.useSession();
  const cartQuery = useCart(Boolean(session?.user));
  const count =
    cartQuery.data?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const isSticky = variant === "sticky";

  return (
    <Link
      href={shopRoutes.cart}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className={cn(
        "relative hidden size-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 xl:flex",
        isSticky ? "bg-[#185b50]/10 text-[#185b50]" : "bg-white/15 text-white",
      )}
    >
      <Image
        src={shopAssets.icons.bag}
        alt=""
        width={18}
        height={18}
        unoptimized
        className={cn("size-[18px]", !isSticky && "brightness-0 invert")}
      />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#185b50] text-[10px] font-medium text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}

export function HomePageV2HeaderActions({
  variant = "overlay",
}: HomePageV2HeaderActionsProps) {
  const { data: session, isPending } = authClient.useSession();
  const isSticky = variant === "sticky";

  if (isPending) {
    return (
      <div
        className={cn(
          "h-10 w-[120px] animate-pulse rounded-full xl:w-40",
          isSticky ? "bg-[#185b50]/10" : "bg-white/20",
        )}
      />
    );
  }

  return (
    <div className="flex items-center gap-3">
      <CartBadge variant={variant} />

      <Link
        href={siteNavigation.book}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#185b50] px-3.5 py-2 text-sm font-medium whitespace-nowrap text-[#f8f5ec] transition-colors hover:bg-[#185b50]/90 sm:px-5 sm:py-2.5 sm:text-base sm:gap-2"
      >
        Book A Visit
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>

      {session ? (
        <UserAccountMenu
          variant={isSticky ? "light" : "dark"}
          className="hidden xl:block"
        />
      ) : (
        <Link
          href="/login"
          className={cn(
            "hidden items-center rounded-full px-5 py-2.5 text-base font-medium transition-colors xl:inline-flex",
            isSticky
              ? "border border-[#185b50] text-[#185b50] hover:bg-[#185b50]/5"
              : "border border-white/40 text-white hover:bg-white/10",
          )}
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
