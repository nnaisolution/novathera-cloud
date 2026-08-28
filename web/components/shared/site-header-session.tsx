"use client";

import Link from "next/link";

import { UserAccountMenu } from "@/components/shared/user-account-menu";
import { authClient } from "@/lib/auth-client";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeaderSession() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-[#f3f3f3]" />;
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className={buttonVariants({
          variant: "outline",
          className:
            "h-[51px] rounded-2xl border-[#023a40] px-6 text-sm font-normal text-[#023a40] uppercase hover:bg-[#023a40]/5",
        })}
      >
        Sign in
      </Link>
    );
  }

  return <UserAccountMenu variant="light" />;
}
