"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingDateOptionButton } from "@/components/features/booking/components/booking-date-option-button";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { BookingTimeSlotButton } from "@/components/features/booking/components/booking-time-slot-button";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import { useBookingSlots } from "@/lib/hooks/use-booking-slots";
import { useBookingStaff } from "@/components/features/booking/hooks/use-booking-staff";
import {
  bookingRoutes,
  getBackRouteFromSlot,
} from "@/components/features/booking/utils/booking-routes";
import {
  formatBookingDateLabel,
  getBookingDateOptions,
  getDefaultBookingDateKey,
} from "@/components/features/booking/utils/booking-slot-dates";

export function BookingSlotForm() {
  const router = useRouter();
  const { state, isHydrated, setSlotDate, setSlotSelection } =
    useBookingWizard();

  const dateOptions = useMemo(() => getBookingDateOptions(), []);
  const selectedDate =
    state.slotDate ?? dateOptions[0]?.value ?? getDefaultBookingDateKey();

  const slotsQuery = useBookingSlots({
    locationId: state.locationId,
    serviceId: state.serviceId,
    date: selectedDate,
    employeeId: state.employeeId,
  });

  const staffQuery = useBookingStaff({
    serviceId: state.serviceId,
    locationId: state.locationId,
  });
  const hasStaffOptions =
    Boolean(state.clientCanChooseStaff) && (staffQuery.data?.length ?? 0) > 0;

  useEffect(() => {
    if (!isHydrated) return;

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
    }
  }, [isHydrated, router, state.details, state.locationId, state.serviceId]);

  useEffect(() => {
    if (!isHydrated || state.slotDate) return;
    setSlotDate(selectedDate);
  }, [isHydrated, selectedDate, setSlotDate, state.slotDate]);

  const slots = slotsQuery.data ?? [];

  function handleDateSelect(date: string) {
    setSlotDate(date);
  }

  function handleTimeSelect(time: string, employeeId: string) {
    const employee = slots.find((slot) => slot.time === time);
    const employeeName =
      employee && employee.employeeId === employeeId
        ? state.employeeName ?? "Assigned professional"
        : "Assigned professional";

    setSlotSelection(time, employeeId, employeeName);
    router.push(bookingRoutes.overview);
  }

  if (
    !isHydrated ||
    !state.details ||
    !state.locationId ||
    !state.serviceId
  ) {
    return null;
  }

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 gap-5 lg:gap-10">
      <BookingBackButton href={getBackRouteFromSlot(hasStaffOptions)} />

      <BookingStepHeader
        title="Choose your slot"
        description="Choose a date and time at which you want to avail your service."
      />

      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:gap-5">
        <div className="flex shrink-0 flex-col gap-5">
          <p className="font-display text-2xl leading-normal text-[#185b50]">
            {formatBookingDateLabel(selectedDate)}
          </p>

          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-full gap-2.5">
              {dateOptions.map((option) => (
                <BookingDateOptionButton
                  key={option.value}
                  option={option}
                  selected={option.value === selectedDate}
                  onSelect={handleDateSelect}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5">
          <p className="shrink-0 font-display text-2xl leading-normal text-[#185b50]">
            Select Time
          </p>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {slotsQuery.isLoading ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                Loading available slots...
              </p>
            ) : slots.length === 0 ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                No slots available for this date. Try another day.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {slots.map((slot) => (
                  <BookingTimeSlotButton
                    key={`${slot.time}-${slot.employeeId}`}
                    time={slot.time}
                    selected={state.slotTime === slot.time}
                    onSelect={() => handleTimeSelect(slot.time, slot.employeeId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
