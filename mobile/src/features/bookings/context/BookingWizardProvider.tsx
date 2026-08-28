import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { CreatedBooking, PublicLocation, PublicService, PublicSlot } from "../bookings";
import { staffDisplayName } from "../bookings";

export type WizardStep = "location" | "category" | "service" | "staff" | "slot" | "confirm" | "success";

export type LocationSelection = {
  id: string;
  name: string;
  timezone: string;
  address: string;
};

export type CategorySelection = {
  id: string;
  name: string;
};

export type ServiceSelection = {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  durationMinutes: number;
  clientCanChooseStaff: boolean;
};

export type StaffSelection = {
  id: string;
  name: string;
};

type BookingWizardState = {
  step: WizardStep;
  location: LocationSelection | null;
  category: CategorySelection | null;
  service: ServiceSelection | null;
  /** Null means "any specialist". Ignored when the service does not offer a choice. */
  staff: StaffSelection | null;
  slotDate: string | null;
  slot: PublicSlot | null;
  created: CreatedBooking | null;
  /**
   * True when the staff step auto-advanced because nobody was listed.
   * Back from slots must then return to the service, not re-enter a step
   * that would skip itself again.
   */
  staffSkipped: boolean;
};

const INITIAL_STATE: BookingWizardState = {
  step: "location",
  location: null,
  category: null,
  service: null,
  staff: null,
  slotDate: null,
  slot: null,
  created: null,
  staffSkipped: false,
};

type BookingWizardContextValue = BookingWizardState & {
  selectLocation: (location: LocationSelection) => void;
  selectCategory: (category: CategorySelection) => void;
  selectService: (service: ServiceSelection) => void;
  selectAnyStaff: () => void;
  selectStaff: (staff: StaffSelection) => void;
  setSlotDate: (dateKey: string) => void;
  selectSlot: (slot: PublicSlot) => void;
  skipStaffStep: () => void;
  goBack: () => void;
  markCreated: (booking: CreatedBooking) => void;
  canLeaveRoute: boolean;
};

const BookingWizardContext = createContext<BookingWizardContextValue | null>(null);

export function locationFromPublic(location: PublicLocation, address: string): LocationSelection {
  return {
    id: location.id,
    name: location.name,
    timezone: location.timezone,
    address,
  };
}

export function serviceFromPublic(service: PublicService): ServiceSelection {
  return {
    id: service.id,
    name: service.name,
    priceCents: service.standardPriceCents,
    currency: service.currency,
    durationMinutes: service.durationMinutes,
    clientCanChooseStaff: service.clientCanChooseStaff,
  };
}

export function staffFromPublic(member: { id: string; firstName: string; lastName: string }): StaffSelection {
  return { id: member.id, name: staffDisplayName(member) };
}

export function BookingWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingWizardState>(INITIAL_STATE);

  const selectLocation = useCallback((location: LocationSelection) => {
    setState((current) => {
      const same = current.location?.id === location.id;
      if (same) return { ...current, location, step: "category" };
      return {
        ...current,
        location,
        category: null,
        service: null,
        staff: null,
        slotDate: null,
        slot: null,
        staffSkipped: false,
        step: "category",
      };
    });
  }, []);

  const selectCategory = useCallback((category: CategorySelection) => {
    setState((current) => {
      const same = current.category?.id === category.id;
      if (same) return { ...current, category, step: "service" };
      return {
        ...current,
        category,
        service: null,
        staff: null,
        slotDate: null,
        slot: null,
        staffSkipped: false,
        step: "service",
      };
    });
  }, []);

  const selectService = useCallback((service: ServiceSelection) => {
    setState((current) => {
      const same = current.service?.id === service.id;
      const nextStep: WizardStep = service.clientCanChooseStaff ? "staff" : "slot";
      if (same) return { ...current, service, step: nextStep };
      return {
        ...current,
        service,
        staff: null,
        slotDate: null,
        slot: null,
        staffSkipped: !service.clientCanChooseStaff,
        step: nextStep,
      };
    });
  }, []);

  const selectAnyStaff = useCallback(() => {
    setState((current) => ({
      ...current,
      staff: null,
      slotDate: current.slotDate,
      slot: null,
      step: "slot",
    }));
  }, []);

  const selectStaff = useCallback((staff: StaffSelection) => {
    setState((current) => {
      const same = current.staff?.id === staff.id;
      if (same) return { ...current, staff, step: "slot" };
      return { ...current, staff, slotDate: current.slotDate, slot: null, step: "slot" };
    });
  }, []);

  const setSlotDate = useCallback((dateKey: string) => {
    setState((current) => ({
      ...current,
      slotDate: dateKey,
      slot: current.slotDate === dateKey ? current.slot : null,
    }));
  }, []);

  const selectSlot = useCallback((slot: PublicSlot) => {
    setState((current) => ({ ...current, slot, step: "confirm" }));
  }, []);

  const skipStaffStep = useCallback(() => {
    setState((current) => ({ ...current, staff: null, staffSkipped: true, step: "slot" }));
  }, []);

  const goBack = useCallback(() => {
    setState((current) => {
      switch (current.step) {
        case "category":
          return { ...current, step: "location" };
        case "service":
          return { ...current, step: "category" };
        case "staff":
          return { ...current, step: "service" };
        case "slot":
          return {
            ...current,
            step: current.service?.clientCanChooseStaff && !current.staffSkipped ? "staff" : "service",
          };
        case "confirm":
          return { ...current, step: "slot" };
        default:
          return current;
      }
    });
  }, []);

  const markCreated = useCallback((booking: CreatedBooking) => {
    setState((current) => ({ ...current, created: booking, step: "success" }));
  }, []);

  const canLeaveRoute = state.step === "location" || state.step === "success";

  const value = useMemo(
    () => ({
      ...state,
      selectLocation,
      selectCategory,
      selectService,
      selectAnyStaff,
      selectStaff,
      setSlotDate,
      selectSlot,
      skipStaffStep,
      goBack,
      markCreated,
      canLeaveRoute,
    }),
    [
      state,
      selectLocation,
      selectCategory,
      selectService,
      selectAnyStaff,
      selectStaff,
      setSlotDate,
      selectSlot,
      skipStaffStep,
      goBack,
      markCreated,
      canLeaveRoute,
    ],
  );

  return <BookingWizardContext.Provider value={value}>{children}</BookingWizardContext.Provider>;
}

export function useBookingWizard(): BookingWizardContextValue {
  const context = useContext(BookingWizardContext);
  if (!context) {
    throw new Error("useBookingWizard must be used within BookingWizardProvider");
  }
  return context;
}
