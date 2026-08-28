"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { WaitlistDialog } from "@/components/features/waitlist/components/waitlist-dialog";

type WaitlistContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openWaitlist: () => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openWaitlist = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openWaitlist,
    }),
    [open, openWaitlist],
  );

  return (
    <WaitlistContext.Provider value={value}>
      {children}
      <WaitlistDialog open={open} onOpenChange={setOpen} />
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const context = useContext(WaitlistContext);

  if (!context) {
    throw new Error("useWaitlist must be used within WaitlistProvider");
  }

  return context;
}
