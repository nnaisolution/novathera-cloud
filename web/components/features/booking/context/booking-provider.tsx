"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { BookingDetailsInput } from "@/components/features/booking/schemas/booking-details";
import type { BookingWizardState } from "@/components/features/booking/types";
import {
  readBookingWizardState,
  writeBookingWizardState,
} from "@/components/features/booking/utils/booking-storage";

type ServiceSelection = {
  serviceId: string;
  serviceName: string;
  priceCents: number;
  currency: string;
  clientCanChooseStaff: boolean;
};

type LocationSelection = {
  locationId: string;
  locationName: string;
  locationTimezone: string;
};

type BookingContextValue = {
  state: BookingWizardState;
  isHydrated: boolean;
  setDetails: (details: BookingDetailsInput) => void;
  setCity: (city: string) => void;
  setLocation: (location: LocationSelection) => void;
  setCategoryId: (categoryId: string) => void;
  setService: (service: ServiceSelection) => void;
  setEmployee: (employeeId: string | null, employeeName: string | null) => void;
  setSlotDate: (slotDate: string) => void;
  setSlotSelection: (slotTime: string, employeeId: string, employeeName: string) => void;
  setFamilyMember: (
    familyMemberId: string | null,
    familyMemberName: string | null,
  ) => void;
  reset: () => void;
};

const defaultState: BookingWizardState = {
  details: null,
  city: null,
  locationId: null,
  locationName: null,
  locationTimezone: null,
  categoryId: null,
  serviceId: null,
  serviceName: null,
  priceCents: null,
  currency: null,
  clientCanChooseStaff: false,
  employeeId: null,
  employeeName: null,
  slotDate: null,
  slotTime: null,
  familyMemberId: null,
  familyMemberName: null,
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<BookingWizardState>(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setState(readBookingWizardState());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    writeBookingWizardState(state);
  }, [isHydrated, state]);

  const setDetails = useCallback((details: BookingDetailsInput) => {
    setState((current) => ({ ...current, details }));
  }, []);

  const setCity = useCallback((city: string) => {
    setState((current) => ({
      ...current,
      city,
      locationId: null,
      locationName: null,
      locationTimezone: null,
    }));
  }, []);

  const setLocation = useCallback((location: LocationSelection) => {
    setState((current) => ({
      ...current,
      locationId: location.locationId,
      locationName: location.locationName,
      locationTimezone: location.locationTimezone,
      categoryId: null,
      serviceId: null,
      serviceName: null,
      priceCents: null,
      currency: null,
      clientCanChooseStaff: false,
      employeeId: null,
      employeeName: null,
      slotDate: null,
      slotTime: null,
    }));
  }, []);

  const setCategoryId = useCallback((categoryId: string) => {
    setState((current) => ({
      ...current,
      categoryId,
      serviceId: null,
      serviceName: null,
      priceCents: null,
      currency: null,
      clientCanChooseStaff: false,
      employeeId: null,
      employeeName: null,
      slotDate: null,
      slotTime: null,
    }));
  }, []);

  const setService = useCallback((service: ServiceSelection) => {
    setState((current) => ({
      ...current,
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      priceCents: service.priceCents,
      currency: service.currency,
      clientCanChooseStaff: service.clientCanChooseStaff,
      employeeId: null,
      employeeName: null,
      slotDate: null,
      slotTime: null,
    }));
  }, []);

  const setEmployee = useCallback(
    (employeeId: string | null, employeeName: string | null) => {
      setState((current) => ({
        ...current,
        employeeId,
        employeeName,
        slotDate: null,
        slotTime: null,
      }));
    },
    [],
  );

  const setSlotDate = useCallback((slotDate: string) => {
    setState((current) => ({
      ...current,
      slotDate,
      slotTime: null,
    }));
  }, []);

  const setSlotSelection = useCallback(
    (slotTime: string, employeeId: string, employeeName: string) => {
      setState((current) => ({
        ...current,
        slotTime,
        employeeId,
        employeeName,
      }));
    },
    [],
  );

  const setFamilyMember = useCallback(
    (familyMemberId: string | null, familyMemberName: string | null) => {
      setState((current) => ({ ...current, familyMemberId, familyMemberName }));
    },
    [],
  );

  const reset = useCallback(() => {
    setState(defaultState);
  }, []);

  const value = useMemo(
    () => ({
      state,
      isHydrated,
      setDetails,
      setCity,
      setLocation,
      setCategoryId,
      setService,
      setEmployee,
      setSlotDate,
      setSlotSelection,
      setFamilyMember,
      reset,
    }),
    [
      state,
      isHydrated,
      setDetails,
      setCity,
      setLocation,
      setCategoryId,
      setService,
      setEmployee,
      setSlotDate,
      setSlotSelection,
      setFamilyMember,
      reset,
    ],
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBookingWizard() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBookingWizard must be used within BookingProvider");
  }
  return context;
}
