"use client";

import { Download } from "lucide-react";
import { toast } from "sonner";

import type { MyBookingItem } from "../types";

const STATUS_BADGE: Record<
  MyBookingItem["status"],
  { label: string; className: string }
> = {
  CONFIRMED: { label: "Completed", className: "bg-[#185b50]/10 text-[#185b50]" },
  COMPLETED: { label: "Completed", className: "bg-[#185b50]/10 text-[#185b50]" },
  CANCELLED: { label: "Cancelled", className: "bg-[#fd3018]/10 text-[#fd3018]" },
  NO_SHOW: { label: "No show", className: "bg-[#546256]/10 text-[#546256]" },
};

const GRID_COLUMNS =
  "grid grid-cols-[140px_minmax(0,300px)_minmax(0,240px)_120px_74px] items-center gap-6";

export function AppointmentHistoryTableHeader() {
  return (
    <div
      className={`${GRID_COLUMNS} w-full border-b border-black/20 bg-white px-[30px] py-5 text-base tracking-[1.6px] text-[#546256] uppercase`}
    >
      <span>Date</span>
      <span>Service</span>
      <span>Provider</span>
      <span>Status</span>
      <span>Receipt</span>
    </div>
  );
}

export function AppointmentHistoryRow({ booking }: { booking: MyBookingItem }) {
  const date = new Date(booking.startTime).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const badge = STATUS_BADGE[booking.status];

  return (
    <div className={`${GRID_COLUMNS} w-full bg-white px-[30px] py-5`}>
      <span className="text-base text-[#546256]">{date}</span>
      <span className="truncate text-base font-semibold text-[#185b50]">
        {booking.service.name}
      </span>
      <span className="truncate text-base text-[#546256]">
        {booking.employee.firstName} {booking.employee.lastName}
      </span>
      <span
        className={`inline-flex w-fit items-center justify-center rounded-full px-4 py-2 text-sm ${badge.className}`}
      >
        {badge.label}
      </span>
      <button
        type="button"
        onClick={() => toast.info("Receipt downloads are coming soon.")}
        className="flex items-center gap-1.5 text-base font-semibold text-[#185b50]"
      >
        <Download className="size-5" aria-hidden />
        PDF
      </button>
    </div>
  );
}
