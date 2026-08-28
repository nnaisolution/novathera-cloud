"use client";

import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import { useBookingStaff } from "@/components/features/booking/hooks/use-booking-staff";
import { bookingRoutes } from "@/components/features/booking/utils/booking-routes";
import { cn } from "@/lib/utils";

export function BookingStaffForm() {
  const router = useRouter();
  const { state, isHydrated, setEmployee } = useBookingWizard();

  const staffQuery = useBookingStaff({
    serviceId: state.serviceId,
    locationId: state.locationId,
  });

  const staff = staffQuery.data ?? [];

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
    if (!isHydrated || staffQuery.isLoading) return;

    if (!state.clientCanChooseStaff || staff.length === 0) {
      router.replace(bookingRoutes.slot);
    }
  }, [
    isHydrated,
    router,
    staff.length,
    staffQuery.isLoading,
    state.clientCanChooseStaff,
  ]);

  const selectedEmployeeId = useMemo(
    () => state.employeeId,
    [state.employeeId],
  );

  function handleAnyAvailable() {
    setEmployee(null, null);
    router.push(bookingRoutes.slot);
  }

  function handleEmployeeSelect(
    employeeId: string,
    firstName: string,
    lastName: string,
  ) {
    setEmployee(employeeId, `${firstName} ${lastName}`.trim());
    router.push(bookingRoutes.slot);
  }

  if (
    !isHydrated ||
    !state.details ||
    !state.locationId ||
    !state.serviceId ||
    staffQuery.isLoading
  ) {
    return null;
  }

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 gap-5 lg:gap-6">
      <BookingBackButton href={bookingRoutes.concern} />

      <BookingStepHeader
        title="Choose your professional"
        description="Select a team member or let us assign the next available professional."
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <button
          type="button"
          onClick={handleAnyAvailable}
          className={cn(
            "flex w-full items-center gap-4 rounded-[16px] bg-[#f3f3f3] px-5 py-4 text-left",
            selectedEmployeeId === null && "ring-1 ring-[#185b50]",
          )}
        >
          <span className="flex size-[50px] items-center justify-center rounded-full bg-white">
            <User className="size-6 text-[#185b50]" />
          </span>
          <span>
            <span className="block text-base font-semibold text-[#185b50]">
              Any available professional
            </span>
            <span className="text-sm text-[#666]">
              We will assign the best available team member
            </span>
          </span>
        </button>

        {staff.map((employee) => (
          <button
            key={employee.id}
            type="button"
            onClick={() =>
              handleEmployeeSelect(
                employee.id,
                employee.firstName,
                employee.lastName,
              )
            }
            className={cn(
              "flex w-full items-center gap-4 rounded-[16px] bg-[#f3f3f3] px-5 py-4 text-left",
              selectedEmployeeId === employee.id && "ring-1 ring-[#185b50]",
            )}
          >
            <span className="flex size-[50px] items-center justify-center rounded-full bg-white">
              <User className="size-6 text-[#185b50]" />
            </span>
            <span>
              <span className="block text-base font-semibold text-[#185b50]">
                {employee.firstName} {employee.lastName}
              </span>
              {employee.jobTitle ? (
                <span className="text-sm text-[#666]">{employee.jobTitle}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
