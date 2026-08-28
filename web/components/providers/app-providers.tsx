"use client";

import { WaitlistProvider } from "@/components/features/waitlist";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/lib/trpc/client";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TRPCReactProvider>
      <WaitlistProvider>
        {children}
        <Toaster />
      </WaitlistProvider>
    </TRPCReactProvider>
  );
}
