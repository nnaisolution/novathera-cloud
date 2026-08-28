"use client";

import Link from "next/link";

import { useMyBookings } from "../hooks/use-my-bookings";
import { MyBookingCard } from "./my-booking-card";

export function UpcomingAppointmentsView() {
  const { data, isLoading } = useMyBookings("upcoming");

  return (
    <div className="flex w-full flex-col items-start gap-2.5">
      <h1 className="font-serif text-[40px] leading-none text-[#185b50]">
        Upcoming Appointments
      </h1>
      <p className="text-base text-[#546256]">Your next scheduled visits</p>

      <div className="mt-[30px] flex w-full flex-col gap-[30px]">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[207px] w-full animate-pulse rounded-[20px] bg-white"
            />
          ))
        ) : data?.items.length ? (
          data.items.map((booking) => (
            <MyBookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <div className="flex w-full flex-col items-center gap-4 rounded-[20px] bg-white py-16 text-center">
            <p className="text-base text-[#546256]">
              No upcoming appointments.
            </p>
            <Link
              href="/book"
              className="text-sm font-medium text-[#185b50] hover:underline"
            >
              Book an appointment
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
