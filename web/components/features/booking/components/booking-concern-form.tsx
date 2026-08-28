"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingConcernCategoryItem } from "@/components/features/booking/components/booking-concern-category-item";
import { BookingConcernListItem } from "@/components/features/booking/components/booking-concern-list-item";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import {
  useBookingConcernCategories,
  useBookingServices,
} from "@/components/features/booking/hooks/use-booking-concerns";
import {
  bookingRoutes,
  getNextRouteAfterConcern,
} from "@/components/features/booking/utils/booking-routes";

export function BookingConcernForm() {
  const router = useRouter();
  const { state, isHydrated, setCategoryId, setService } = useBookingWizard();

  const categoriesQuery = useBookingConcernCategories();
  const [search, setSearch] = useState("");

  const selectedCategoryId =
    state.categoryId ?? categoriesQuery.data?.[0]?.id ?? null;

  const servicesQuery = useBookingServices({
    categoryId: selectedCategoryId ?? undefined,
    locationId: state.locationId ?? undefined,
    search,
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (!state.details) {
      router.replace(bookingRoutes.details);
      return;
    }

    if (!state.locationId) {
      router.replace(bookingRoutes.clinic);
    }
  }, [isHydrated, router, state.details, state.locationId]);

  useEffect(() => {
    if (!isHydrated || state.categoryId || !categoriesQuery.data?.length) return;
    setCategoryId(categoriesQuery.data[0]!.id);
  }, [categoriesQuery.data, isHydrated, setCategoryId, state.categoryId]);

  const services = servicesQuery.data ?? [];

  const selectedServiceId = useMemo(() => {
    if (!state.serviceId) return null;
    return services.some((service) => service.id === state.serviceId)
      ? state.serviceId
      : null;
  }, [services, state.serviceId]);

  function handleCategorySelect(categoryId: string) {
    setCategoryId(categoryId);
    setSearch("");
  }

  function handleServiceSelect(serviceId: string) {
    const service = services.find((item) => item.id === serviceId);
    if (!service) return;

    setService({
      serviceId: service.id,
      serviceName: service.name,
      priceCents: service.standardPriceCents,
      currency: service.currency,
      clientCanChooseStaff: service.clientCanChooseStaff,
    });

    router.push(getNextRouteAfterConcern(service.clientCanChooseStaff));
  }

  if (!isHydrated || !state.details || !state.locationId) {
    return null;
  }

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:gap-6">
        <BookingBackButton href={bookingRoutes.clinic} />

        <BookingStepHeader
          title="Select your concern"
          description="Choose a service that aligns with your needs and preferences."
        />

        <div className="flex min-h-0 flex-1 flex-col gap-5 lg:gap-[30px]">
          <label className="flex h-12 shrink-0 items-center rounded-[16px] bg-[#f3f3f3] px-5 py-2.5 lg:h-[60px]">
            <Search
              className="mr-1 size-6 shrink-0 text-[#666]"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services"
              className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] text-[#222] outline-none placeholder:text-[#666]"
            />
          </label>

          <div className="-mx-1 shrink-0 overflow-x-auto px-1 pb-1">
            <div className="flex w-max gap-5">
              {(categoriesQuery.data ?? []).map((category) => (
                <BookingConcernCategoryItem
                  key={category.id}
                  category={category}
                  selected={category.id === selectedCategoryId}
                  onSelect={handleCategorySelect}
                />
              ))}
            </div>
          </div>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {servicesQuery.isLoading ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                Loading services...
              </p>
            ) : services.length === 0 ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                No services found. Try another search.
              </p>
            ) : (
              <div className="flex flex-col gap-4 lg:gap-5">
                {services.map((service) => (
                  <BookingConcernListItem
                    key={service.id}
                    service={service}
                    selected={selectedServiceId === service.id}
                    onSelect={handleServiceSelect}
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
