"use client";

import { CalendarDays, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type UserAccountMenuProps = {
  variant?: "light" | "dark";
  className?: string;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function UserAccountMenu({
  variant = "light",
  className,
}: UserAccountMenuProps) {
  const { data: session } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!session?.user) return null;

  const { name, email, image } = session.user;
  const initials = getInitials(name, email);
  const isDark = variant === "dark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex size-10 items-center justify-center overflow-hidden rounded-full text-sm font-medium transition-opacity hover:opacity-90",
          isDark
            ? "bg-white/15 text-white ring-1 ring-white/40"
            : "bg-[#185b50] text-white ring-1 ring-[#185b50]/20",
        )}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatars use arbitrary remote hosts
          <img
            src={image}
            alt={name ?? email ?? "Account"}
            width={40}
            height={40}
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[240px] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white py-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
          <div className="border-b border-[#ececec] px-4 py-3">
            {name ? (
              <p className="truncate text-sm font-medium text-[#1a1c18]">
                {name}
              </p>
            ) : null}
            {email ? (
              <p className="truncate text-sm text-[#1a1c18]/70">{email}</p>
            ) : null}
          </div>

          <Link
            href="/account/appointments/upcoming"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1a1c18] transition-colors hover:bg-[#f5f5f0]"
            onClick={() => setOpen(false)}
          >
            <CalendarDays
              className="size-4 shrink-0 text-[#185b50]"
              aria-hidden
            />
            My bookings
          </Link>

          <Link
            href="/account/orders"
            role="menuitem"
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#1a1c18] transition-colors hover:bg-[#f5f5f0]"
            onClick={() => setOpen(false)}
          >
            <Package className="size-4 shrink-0 text-[#185b50]" aria-hidden />
            Orders
          </Link>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-[#1a1c18] transition-colors hover:bg-[#f5f5f0]"
            onClick={() => {
              setOpen(false);
              void authClient.signOut();
            }}
          >
            <LogOut className="size-4 shrink-0 text-[#185b50]" aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
