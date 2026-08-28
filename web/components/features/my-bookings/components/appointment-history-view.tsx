"use client";

import { useMyBookings } from "../hooks/use-my-bookings";
import {
  AppointmentHistoryRow,
  AppointmentHistoryTableHeader,
} from "./appointment-history-row";

export function AppointmentHistoryView() {
  const { data, isLoading } = useMyBookings("past");

  return (
    <div className="flex w-full flex-col items-start gap-2.5">
      <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
        Appointment History
      </h1>
      <p className="text-base text-[#546256]">Every visit, in one place</p>

      <div className="mt-[30px] w-full overflow-x-auto rounded-[20px] bg-white">
        <div className="min-w-[1000px]">
          <AppointmentHistoryTableHeader />

          {isLoading ? (
            <div className="flex flex-col gap-px">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-[66px] w-full animate-pulse bg-[#faf7ee]" />
              ))}
            </div>
          ) : data?.items.length ? (
            data.items.map((booking) => (
              <AppointmentHistoryRow key={booking.id} booking={booking} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <p className="text-base text-[#546256]">No past appointments yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
