"use client";

import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBookingSlots } from "@/lib/hooks/use-booking-slots";
import { localDateTimeToUtc } from "@/lib/utils/timezone";

import { useMyBookingActions } from "../hooks/use-my-booking-actions";
import type { MyBookingItem } from "../types";

function tomorrowInTimezone(timeZone: string) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(tomorrow);
}

export function RescheduleDialog({ booking }: { booking: MyBookingItem }) {
  const { rescheduleBooking, isRescheduling } = useMyBookingActions();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() =>
    tomorrowInTimezone(booking.location.timezone),
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const slotsQuery = useBookingSlots({
    locationId: booking.location.id,
    serviceId: booking.service.id,
    date,
    employeeId: booking.employee.id,
  });

  function handleDateChange(value: string) {
    setDate(value);
    setSelectedTime(null);
  }

  async function handleConfirm() {
    if (!selectedTime) return;
    const startTime = localDateTimeToUtc(
      new Date(`${date}T12:00:00`),
      selectedTime,
      booking.location.timezone,
    );
    await rescheduleBooking({ id: booking.id, startTime });
    setOpen(false);
    setSelectedTime(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="rounded-full border border-[#546256] px-[15px] py-[11px] text-sm text-[#546256] transition-colors hover:bg-[#546256]/5"
          >
            Reschedule
          </button>
        }
      />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Reschedule this booking</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-[#546256]">
            New date
            <input
              type="date"
              value={date}
              min={tomorrowInTimezone(booking.location.timezone)}
              onChange={(event) => handleDateChange(event.target.value)}
              className="rounded-lg border border-[#e8e8e8] bg-transparent px-3 py-2 text-sm text-[#222] outline-none focus-visible:border-[#185b50]"
            />
          </label>

          <div className="flex flex-col gap-1.5 text-sm text-[#546256]">
            Available times
            {slotsQuery.isLoading ? (
              <p className="text-sm text-[#546256]">Loading times...</p>
            ) : slotsQuery.data?.length ? (
              <div className="grid grid-cols-3 gap-2">
                {slotsQuery.data.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setSelectedTime(slot.time)}
                    aria-pressed={selectedTime === slot.time}
                    className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedTime === slot.time
                        ? "bg-[#185b50] text-white"
                        : "bg-[#f3f3f3] text-[#222] hover:bg-[#e8e8e8]"
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#546256]">
                No times available on this date.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose
            render={
              <button
                type="button"
                className="rounded-full border border-[#546256] px-[15px] py-[11px] text-sm text-[#546256]"
              >
                Keep current time
              </button>
            }
          />
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedTime || isRescheduling}
            className="rounded-full bg-[#185b50] px-[15px] py-[11px] text-sm text-white disabled:opacity-60"
          >
            {isRescheduling ? "Rescheduling..." : "Confirm new time"}
          </button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
