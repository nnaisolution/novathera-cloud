"use client";

import { CalendarDays, HeartHandshake, MapPin, User, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingOverviewSummaryItem } from "@/components/features/booking/components/booking-overview-summary-item";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import { useSubmitBooking } from "@/components/features/booking/hooks/use-submit-booking";
import { useFamilyMembers } from "@/components/features/family-members";
import { writeBookingConfirmation } from "@/components/features/booking/utils/booking-confirmation-storage";
import { bookingRoutes } from "@/components/features/booking/utils/booking-routes";
import { clearBookingWizardState } from "@/components/features/booking/utils/booking-storage";
import { getBookingSummary } from "@/components/features/booking/utils/get-booking-summary";
import { localDateTimeToUtc } from "@/lib/utils/timezone";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { getNestTrpcErrorMessage } from "@/lib/trpc/nest-error-message";
import { useNestTrpc } from "@/lib/trpc/nest-client";

type PaymentChoice = { bookingId: string };

export function BookingOverviewForm() {
  const router = useRouter();
  const trpc = useNestTrpc();
  const { state, isHydrated, setFamilyMember, reset } = useBookingWizard();
  const submitBooking = useSubmitBooking();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const familyMembersQuery = useFamilyMembers(Boolean(session?.user));
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice | null>(
    null,
  );
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] =
    useState(false);

  const checkoutMutation = useMutation(
    trpc.bookings.createCheckoutSession.mutationOptions(),
  );

  const summary = useMemo(() => getBookingSummary(state), [state]);

  useEffect(() => {
    if (!isHydrated || hasConfirmed) return;

    if (!state.details) {
      router.replace(bookingRoutes.details);
      return;
    }

    if (!state.locationId) {
      router.replace(bookingRoutes.clinic);
      return;
    }

    if (!state.serviceId) {
      router.replace(bookingRoutes.concern);
      return;
    }

    if (!state.slotDate || !state.slotTime || !state.employeeId) {
      router.replace(bookingRoutes.slot);
    }
  }, [
    isHydrated,
    hasConfirmed,
    router,
    state.details,
    state.employeeId,
    state.locationId,
    state.serviceId,
    state.slotDate,
    state.slotTime,
  ]);

  async function handleConfirmBooking() {
    if (
      !state.serviceId ||
      !state.locationId ||
      !state.employeeId ||
      !state.slotDate ||
      !state.slotTime ||
      !state.locationTimezone
    ) {
      return;
    }

    const startTime = localDateTimeToUtc(
      new Date(`${state.slotDate}T12:00:00`),
      state.slotTime,
      state.locationTimezone,
    );

    try {
      const result = await submitBooking.mutateAsync({
        serviceId: state.serviceId,
        locationId: state.locationId,
        employeeId: state.employeeId,
        startTime,
        notes: state.details?.phone
          ? `Phone: ${state.details.phone}`
          : undefined,
        familyMemberId: state.familyMemberId ?? undefined,
      });

      setHasConfirmed(true);
      writeBookingConfirmation({ bookingId: result.id });
      reset();
      clearBookingWizardState();

      if (result.paymentStatus === "PENDING") {
        setPaymentChoice({ bookingId: result.id });
      } else {
        router.push(bookingRoutes.confirmation);
      }
    } catch (error) {
      toast.error("Unable to confirm booking", {
        description: getNestTrpcErrorMessage(error),
      });
    }
  }

  async function handlePayOnline() {
    if (!paymentChoice) return;

    setIsRedirectingToCheckout(true);
    try {
      const { url } = await checkoutMutation.mutateAsync({
        bookingId: paymentChoice.bookingId,
      });
      window.location.href = url;
    } catch (error) {
      setIsRedirectingToCheckout(false);
      toast.error("Unable to start checkout", {
        description: getNestTrpcErrorMessage(error),
      });
    }
  }

  function handlePayAtVenue() {
    setPaymentChoice(null);
    router.push(bookingRoutes.confirmation);
  }

  if (hasConfirmed) {
    return (
      <Dialog
        open={Boolean(paymentChoice)}
        onOpenChange={(open) => {
          if (!open && !isRedirectingToCheckout) {
            handlePayAtVenue();
          }
        }}
      >
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>How would you like to pay?</DialogTitle>
            <DialogDescription>
              Your booking is confirmed. Pay online now, or pay when you arrive
              at the clinic.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handlePayAtVenue}
              disabled={isRedirectingToCheckout}
              className="h-12 flex-1 rounded-[16px]"
            >
              Pay at the venue
            </Button>
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={isRedirectingToCheckout}
              className="h-12 flex-1 rounded-[16px] bg-[#185b50] text-white hover:bg-[#185b50]/90"
            >
              {isRedirectingToCheckout ? "Redirecting..." : "Pay online now"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    );
  }

  if (
    !isHydrated ||
    !state.details ||
    !state.locationId ||
    !state.serviceId ||
    !state.slotDate ||
    !state.slotTime ||
    !summary
  ) {
    return null;
  }

  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 gap-6 lg:gap-10">
      <div className="flex flex-col gap-5 pb-2 lg:min-h-0 lg:flex-1 lg:gap-10 lg:overflow-y-auto">
        <BookingBackButton href={bookingRoutes.slot} />

        <BookingStepHeader
          title="Book Overview"
          description="Review your booking details before confirming."
        />

        <div className="flex flex-col gap-5">
          <BookingOverviewSummaryItem
            icon={
              <HeartHandshake
                className="size-[42px] text-[#185b50]"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            label="Service"
            value={summary.serviceName}
          />
          <BookingOverviewSummaryItem
            icon={
              <CalendarDays
                className="size-[42px] text-[#185b50]"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            label="Date & Time"
            value={summary.dateTimeLabel}
          />
          <BookingOverviewSummaryItem
            icon={
              <MapPin
                className="size-[42px] text-[#185b50]"
                strokeWidth={1.5}
                aria-hidden
              />
            }
            label="Location"
            value={summary.locationName}
          />
          {summary.staffName ? (
            <BookingOverviewSummaryItem
              icon={
                <User
                  className="size-[42px] text-[#185b50]"
                  strokeWidth={1.5}
                  aria-hidden
                />
              }
              label="Professional"
              value={summary.staffName}
            />
          ) : null}

          {familyMembersQuery.data?.length ? (
            <div className="flex items-center gap-5 rounded-[16px] bg-[#f3f3f3] p-5">
              <div className="flex size-[50px] shrink-0 items-center justify-center">
                <Users
                  className="size-[42px] text-[#185b50]"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <span className="text-base leading-normal text-[#222]">
                  Who is this visit for?
                </span>
                <select
                  value={state.familyMemberId ?? ""}
                  onChange={(event) => {
                    const id = event.target.value || null;
                    const member = familyMembersQuery.data?.find(
                      (candidate) => candidate.id === id,
                    );
                    setFamilyMember(id, member?.name ?? null);
                  }}
                  className="font-display w-full appearance-none rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-xl text-[#185b50] outline-none focus-visible:border-[#185b50]"
                >
                  <option value="">Myself</option>
                  {familyMembersQuery.data.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {sessionPending ? (
        <div className="h-12 w-full shrink-0 animate-pulse rounded-[16px] bg-[#f3f3f3]" />
      ) : !isAuthenticated ? (
        <div className="shrink-0 space-y-4 rounded-[16px] border border-[#e8e8e8] bg-[#fafafa] p-5">
          <p className="text-base font-medium text-[#1a1c18]">
            Sign in to confirm your booking
          </p>
          <p className="text-sm text-[#5c5f58]">
            Your selections are saved. Sign in or create an account to complete
            your booking.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/login?next=${encodeURIComponent(bookingRoutes.overview)}`}
              className={buttonVariants({
                className:
                  "h-12 flex-1 rounded-[16px] bg-[#185b50] hover:bg-[#185b50]/90",
              })}
            >
              Sign in
            </Link>
            <Link
              href={`/register?next=${encodeURIComponent(bookingRoutes.overview)}`}
              className={buttonVariants({
                variant: "outline",
                className: "h-12 flex-1 rounded-[16px]",
              })}
            >
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          onClick={handleConfirmBooking}
          disabled={submitBooking.isPending}
          className="h-12 w-full shrink-0 rounded-[16px] bg-[#185b50] px-[30px] py-4 text-base font-normal text-white hover:bg-[#185b50]/90 lg:h-[60px] lg:text-lg"
        >
          {submitBooking.isPending ? "Confirming..." : "Confirm Booking"}
        </Button>
      )}

      <Dialog
        open={Boolean(paymentChoice)}
        onOpenChange={(open) => {
          if (!open && !isRedirectingToCheckout) {
            handlePayAtVenue();
          }
        }}
      >
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>How would you like to pay?</DialogTitle>
            <DialogDescription>
              Your booking is confirmed. Pay online now, or pay when you arrive
              at the clinic.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handlePayAtVenue}
              disabled={isRedirectingToCheckout}
              className="h-12 flex-1 rounded-[16px]"
            >
              Pay at the venue
            </Button>
            <Button
              type="button"
              onClick={handlePayOnline}
              disabled={isRedirectingToCheckout}
              className="h-12 flex-1 rounded-[16px] bg-[#185b50] text-white hover:bg-[#185b50]/90"
            >
              {isRedirectingToCheckout ? "Redirecting..." : "Pay online now"}
            </Button>
          </DialogFooter>
        </DialogPopup>
      </Dialog>
    </div>
  );
}
