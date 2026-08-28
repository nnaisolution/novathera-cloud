"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

import { useMyBookingActions } from "../hooks/use-my-booking-actions";
import { formatAppointmentDateParts } from "../utils/format-appointment-date";
import type { MyBookingItem } from "../types";
import { RescheduleDialog } from "./reschedule-dialog";

export function MyBookingCard({ booking }: { booking: MyBookingItem }) {
  const trpc = useNestTrpc();
  const { cancelBooking, isCancelling } = useMyBookingActions();
  const [reason, setReason] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const checkoutMutation = useMutation(
    trpc.bookings.createCheckoutSession.mutationOptions(),
  );

  const { day, month, time } = formatAppointmentDateParts(
    new Date(booking.startTime),
    booking.location.timezone,
  );

  const isUpcomingConfirmed =
    booking.status === "CONFIRMED" && new Date(booking.startTime) > new Date();
  const canPayNow =
    booking.status === "CONFIRMED" && booking.paymentStatus === "PENDING";

  async function handlePayNow() {
    try {
      const { url } = await checkoutMutation.mutateAsync({
        bookingId: booking.id,
      });
      window.location.href = url;
    } catch (error) {
      toast.error("Unable to start checkout", {
        description: getNestTrpcErrorMessage(error),
      });
    }
  }

  async function handleConfirmCancel() {
    await cancelBooking({ id: booking.id, reason: reason.trim() || undefined });
    setCancelOpen(false);
    setReason("");
  }

  return (
    <div className="flex w-full flex-col items-start gap-[30px] rounded-[20px] bg-white p-[30px] sm:flex-row">
      <div className="flex w-full shrink-0 flex-col items-center justify-between gap-1 self-stretch rounded-[20px] bg-[#e5ebd8]/40 px-5 py-4 sm:w-[120px]">
        <div className="flex flex-col items-center gap-1">
          <p className="font-serif text-[30px] leading-none text-[#bf913d]">
            {day}
          </p>
          <p className="text-base text-[#546256]">{month}</p>
        </div>
        <p className="text-base text-[#546256]">{time}</p>
      </div>

      <div className="flex flex-col items-start gap-5">
        <div className="flex flex-col items-start gap-2.5">
          <p className="font-serif text-2xl text-[#185b50]">
            {booking.service.name} · {booking.durationMinutes} min
          </p>
          <p className="text-base text-[#546256]">
            with {booking.employee.firstName} {booking.employee.lastName}
          </p>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-4 text-[#546256]" aria-hidden />
            <p className="text-base text-[#546256]">{booking.location.name}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2.5">
          {canPayNow ? (
            <button
              type="button"
              onClick={handlePayNow}
              disabled={checkoutMutation.isPending}
              className="rounded-full bg-[#bf913d] px-3.5 py-2.5 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {checkoutMutation.isPending ? "Redirecting..." : "Pay now"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() =>
              toast.info("Booking details are coming soon.")
            }
            className="rounded-full bg-[#185b50] px-3.5 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
          >
            View details
          </button>

          {isUpcomingConfirmed ? <RescheduleDialog booking={booking} /> : null}

          {isUpcomingConfirmed ? (
            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
              <DialogTrigger
                render={
                  <button
                    type="button"
                    className="rounded-full border border-[#546256] px-[15px] py-[11px] text-sm text-[#fd3018] transition-colors hover:bg-[#fd3018]/5"
                  >
                    Cancel
                  </button>
                }
              />
              <DialogPopup>
                <DialogHeader>
                  <DialogTitle>Cancel this booking?</DialogTitle>
                </DialogHeader>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason (optional)"
                  rows={3}
                  className="w-full rounded-lg border border-[#e8e8e8] bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-[#185b50]"
                />
                <DialogFooter>
                  <DialogClose
                    render={
                      <button
                        type="button"
                        className="rounded-full border border-[#546256] px-[15px] py-[11px] text-sm text-[#546256]"
                      >
                        Keep booking
                      </button>
                    }
                  />
                  <button
                    type="button"
                    onClick={handleConfirmCancel}
                    disabled={isCancelling}
                    className="rounded-full bg-[#fd3018] px-[15px] py-[11px] text-sm text-white disabled:opacity-60"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel booking"}
                  </button>
                </DialogFooter>
              </DialogPopup>
            </Dialog>
          ) : null}
        </div>
      </div>
    </div>
  );
}
