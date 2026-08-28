import Image from "next/image";

import { bookingAssets } from "@/components/features/booking/assets";
import { BookingLeftPanel } from "@/components/features/booking/components/booking-left-panel";

export function BookingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#faf7ee] lg:h-dvh lg:overflow-hidden">
      <div className="flex w-full flex-1 flex-col items-center gap-6 px-6 py-6 lg:h-full lg:min-h-0 lg:gap-8 lg:px-[160px] lg:py-8">
        <div className="relative h-12 w-[220px] shrink-0 sm:w-[260px] lg:h-16 lg:w-[329px]">
          <Image
            src={bookingAssets.logo}
            alt="NovaThera"
            fill
            priority
            className="object-contain"
            sizes="329px"
          />
        </div>

        <div className="flex w-full flex-1 flex-col items-stretch gap-6 lg:min-h-0 lg:flex-row lg:gap-[120px]">
          <BookingLeftPanel />

          <div className="flex w-full flex-1 flex-col rounded-[30px] bg-white p-6 lg:min-h-0 lg:w-[790px] lg:shrink-0 lg:overflow-hidden lg:p-[30px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
