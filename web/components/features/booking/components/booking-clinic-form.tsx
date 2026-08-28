"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, MapPin, Search } from "lucide-react";

import { BookingBackButton } from "@/components/features/booking/components/booking-back-button";
import { BookingClinicListItem } from "@/components/features/booking/components/booking-clinic-list-item";
import { BookingStepHeader } from "@/components/features/booking/components/booking-step-header";
import { useBookingWizard } from "@/components/features/booking/context/booking-provider";
import {
  useBookingCities,
  useBookingLocations,
} from "@/components/features/booking/hooks/use-booking-locations";
import { bookingRoutes } from "@/components/features/booking/utils/booking-routes";
import { cn } from "@/lib/utils";

export function BookingClinicForm() {
  const router = useRouter();
  const { state, isHydrated, setCity, setLocation } = useBookingWizard();
  const citiesQuery = useBookingCities();

  const [search, setSearch] = useState("");
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const cityMenuRef = useRef<HTMLDivElement>(null);

  const selectedCity = state.city ?? citiesQuery.data?.[0] ?? "";

  const locationsQuery = useBookingLocations({
    city: selectedCity || undefined,
    search,
  });

  useEffect(() => {
    if (!isHydrated) return;

    if (!state.details) {
      router.replace(bookingRoutes.details);
    }
  }, [isHydrated, router, state.details]);

  useEffect(() => {
    if (!isHydrated || state.city || !citiesQuery.data?.length) return;
    setCity(citiesQuery.data[0]!);
  }, [citiesQuery.data, isHydrated, setCity, state.city]);

  useEffect(() => {
    if (!cityMenuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!cityMenuRef.current?.contains(event.target as Node)) {
        setCityMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [cityMenuOpen]);

  const locations = locationsQuery.data ?? [];

  const selectedLocationId = useMemo(() => {
    if (!state.locationId) return null;
    return locations.some((location) => location.id === state.locationId)
      ? state.locationId
      : null;
  }, [locations, state.locationId]);

  function handleCitySelect(city: string) {
    setCity(city);
    setCityMenuOpen(false);
    setSearch("");
  }

  function handleLocationSelect(locationId: string) {
    const location = locations.find((item) => item.id === locationId);
    if (!location) return;

    setLocation({
      locationId: location.id,
      locationName: location.name,
      locationTimezone: location.timezone,
    });
    router.push(bookingRoutes.concern);
  }

  if (!isHydrated || !state.details) {
    return null;
  }

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0 gap-5 lg:gap-6">
      <BookingBackButton href={bookingRoutes.details} />

      <BookingStepHeader
        title="Choose your clinic"
        description="Choose your nearest clinic that aligns with your needs and preferences."
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-5">
        <div className="relative shrink-0" ref={cityMenuRef}>
          <button
            type="button"
            onClick={() => setCityMenuOpen((open) => !open)}
            className="flex h-12 w-full items-center justify-between rounded-[16px] border border-[#185b50] bg-[#f3f3f3] px-5 py-2.5 lg:h-[60px]"
            aria-expanded={cityMenuOpen}
            aria-haspopup="listbox"
          >
            <span className="flex items-center gap-1">
              <MapPin
                className="size-6 shrink-0 text-[#185b50]"
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="text-base font-semibold leading-[1.5] text-[#185b50]">
                {selectedCity || "Select city"}
              </span>
            </span>
            <ChevronDown
              className={cn(
                "size-6 text-[#185b50] transition-transform",
                cityMenuOpen && "rotate-180",
              )}
              strokeWidth={1.5}
              aria-hidden
            />
          </button>

          {cityMenuOpen ? (
            <ul
              role="listbox"
              className="absolute top-[calc(100%+8px)] z-20 max-h-48 w-full overflow-y-auto rounded-[16px] border border-[#cfcfcf] bg-white p-2 shadow-lg"
            >
              {(citiesQuery.data ?? []).map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={city === selectedCity}
                    onClick={() => handleCitySelect(city)}
                    className={cn(
                      "w-full rounded-[10px] px-4 py-2.5 text-left text-base leading-[1.5] text-[#222] hover:bg-[#f3f3f3]",
                      city === selectedCity && "bg-[#f3f3f3] font-semibold",
                    )}
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[16px] bg-[#f3f3f3] p-4 lg:gap-5 lg:p-5">
          <label className="flex shrink-0 items-center gap-1 rounded-[10px] border border-[#cfcfcf] bg-white px-4 py-2.5">
            <Search
              className="size-6 shrink-0 text-[#666]"
              strokeWidth={1.5}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search clinics..."
              className="min-w-0 flex-1 bg-transparent text-base leading-[1.5] text-[#222] outline-none placeholder:text-[#666]"
            />
          </label>

          <div className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            {locationsQuery.isLoading ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                Loading clinics...
              </p>
            ) : locations.length === 0 ? (
              <p className="px-2 py-4 text-sm leading-[1.5] text-[#666]">
                No clinics found. Try another search.
              </p>
            ) : (
              <div className="flex flex-col gap-4 lg:gap-5">
                {locations.map((location) => (
                  <BookingClinicListItem
                    key={location.id}
                    location={location}
                    selected={selectedLocationId === location.id}
                    onSelect={handleLocationSelect}
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
