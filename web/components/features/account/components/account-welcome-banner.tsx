"use client";

import { Award } from "lucide-react";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import { authClient } from "@/lib/auth-client";

import { MOCK_MEMBERSHIP_TIER } from "../utils/mock-account-data";

function formatMemberSince(createdAt: Date | string | undefined) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `Member since ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;
}

export function AccountWelcomeBanner() {
  const { data: session, isPending } = authClient.useSession();

  const firstName = session?.user.name?.trim().split(/\s+/)[0] ?? "there";
  const memberSince = formatMemberSince(session?.user.createdAt);

  return (
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div className="flex flex-col items-start gap-5">
        <p className="text-2xl text-[#185b50]">Welcome Back</p>

        {isPending ? (
          <div className="h-[59px] w-[294px] animate-pulse rounded-2xl bg-[#e5ebd8]/60" />
        ) : (
          <p className="font-serif text-[48px] leading-none text-[#185b50]">
            Hello, {firstName}
          </p>
        )}

        <div className="flex items-center gap-2.5 text-base">
          {memberSince ? (
            <>
              <span className="text-[#185b50]">{memberSince}</span>
              <span className="size-1 rounded-full bg-[#185b50]" aria-hidden />
            </>
          ) : null}
          <span className="flex items-center gap-2.5 text-[#bf913d]">
            <Award className="size-5" aria-hidden />
            {MOCK_MEMBERSHIP_TIER}
          </span>
        </div>
      </div>

      <Link
        href={siteNavigation.book}
        className="inline-flex h-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#185b50] px-[30px] text-lg text-white transition-opacity hover:opacity-90"
      >
        Book new appointment
      </Link>
    </div>
  );
}
