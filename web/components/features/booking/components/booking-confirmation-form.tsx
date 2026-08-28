"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { bookingAssets } from "@/components/features/booking/assets";
import { BookingConfirmationDivider } from "@/components/features/booking/components/booking-confirmation-divider";
import { useBookingConfirmation } from "@/components/features/booking/hooks/use-booking-confirmation";
import {
  clearBookingConfirmation,
  readBookingConfirmation,
} from "@/components/features/booking/utils/booking-confirmation-storage";
import { bookingRoutes } from "@/components/features/booking/utils/booking-routes";
import { formatDateTimeInTimezone } from "@/lib/utils/timezone";
import { Button } from "@/components/ui/button";
import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

function formatPrice(priceCents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

export function BookingConfirmationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trpc = useNestTrpc();
  const checkoutId =
    searchParams.get("session_id") ?? searchParams.get("checkout_id");

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = readBookingConfirmation();
    setBookingId(stored?.bookingId ?? null);
    setIsHydrated(true);

    if (!stored && !checkoutId) {
      router.replace(bookingRoutes.details);
    }
    // Only run this on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bookingQuery = useBookingConfirmation(bookingId, Boolean(checkoutId));
  const booking = bookingQuery.data;

  const checkoutMutation = useMutation(
    trpc.bookings.createCheckoutSession.mutationOptions(),
  );

  async function handlePayOnline() {
    if (!booking || booking.paymentStatus !== "PENDING") return;

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

  function handleViewAppointments() {
    clearBookingConfirmation();
    router.push("/bookings");
  }

  if (!isHydrated) {
    return null;
  }

  if (!bookingId && checkoutId) {
    return (
      <div className="flex flex-col lg:h-full lg:min-h-0 items-center justify-center gap-6 text-center">
        <p className="max-w-[520px] text-base leading-[1.5] text-[#222]">
          Payment received. View your booking and its payment status from My
          Bookings.
        </p>
        <Button
          type="button"
          onClick={() => router.push("/bookings")}
          className="h-12 rounded-[16px] bg-[#185b50] px-[30px] py-4 text-base font-normal text-white hover:bg-[#185b50]/90"
        >
          Go to My Bookings
        </Button>
      </div>
    );
  }

  if (!bookingId) {
    return null;
  }

  if (bookingQuery.isLoading || !booking) {
    return (
      <div className="flex flex-col lg:h-full lg:min-h-0 items-center justify-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-[#f3f3f3]" />
        <div className="h-6 w-64 animate-pulse rounded-[8px] bg-[#f3f3f3]" />
      </div>
    );
  }

  const isConfirmingPayment =
    Boolean(checkoutId) && booking.paymentStatus !== "PAID";
  const canPayOnline = booking.paymentStatus === "PENDING";
  const isRedirecting = checkoutMutation.isPending;

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 justify-between gap-6 lg:gap-10">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 text-center lg:gap-10">
        <Image
          src={bookingAssets.bookingAwaited}
          alt=""
          width={60}
          height={60}
          className="size-[60px] shrink-0"
          aria-hidden
        />

        <div className="flex max-w-[672px] flex-col gap-2.5">
          <h2 className="font-display text-[32px] leading-normal font-normal text-[#185b50] lg:text-[40px]">
            Booking Confirmed
          </h2>
          <p className="text-base leading-[1.5] text-[#222]">
            Thanks for choosing us. Here are your booking details.
          </p>
        </div>

        <BookingConfirmationDivider />

        <div className="flex max-w-[480px] flex-col gap-2 text-base leading-[1.5] text-[#222]">
          <p>{booking.service.name}</p>
          <p>
            {formatDateTimeInTimezone(
              new Date(booking.startTime),
              booking.location.timezone,
            )}
          </p>
          <p>{booking.location.name}</p>
          <p>
            {booking.employee.firstName} {booking.employee.lastName}
          </p>
          <p>Booking reference: {booking.bookingCode}</p>
          <p className="font-medium">
            {formatPrice(booking.priceCents, booking.currency)}
          </p>
        </div>

        {isConfirmingPayment ? (
          <div className="flex items-center gap-2 rounded-[16px] bg-[#f3f3f3] px-5 py-3 text-sm text-[#666]">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Confirming your payment...
          </div>
        ) : booking.paymentStatus === "PAID" ? (
          <div className="rounded-[16px] bg-[#eaf4f1] px-5 py-3 text-sm font-medium text-[#185b50]">
            Paid online &middot;{" "}
            {formatPrice(booking.priceCents, booking.currency)}
          </div>
        ) : canPayOnline ? (
          <div className="flex w-full max-w-[480px] flex-col items-center gap-3">
            <p className="text-sm leading-[1.5] text-[#666]">
              Payment pending &mdash; pay online now, or pay at the clinic when
              you arrive.
            </p>
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={isRedirecting}
              className="h-12 rounded-[16px] bg-[#185b50] px-[30px] text-white hover:bg-[#185b50]/90"
            >
              {isRedirecting
                ? "Redirecting to secure checkout..."
                : "Pay online now"}
            </Button>
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={handleViewAppointments}
        className="h-12 w-full shrink-0 rounded-[16px] bg-[#185b50] px-[30px] py-4 text-base font-normal text-white hover:bg-[#185b50]/90 lg:h-[60px] lg:text-lg"
      >
        View Appointments
      </Button>
    </div>
  );
}
