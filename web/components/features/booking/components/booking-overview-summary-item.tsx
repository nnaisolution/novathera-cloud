import type { ReactNode } from "react";

type BookingOverviewSummaryItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

export function BookingOverviewSummaryItem({
  icon,
  label,
  value,
}: BookingOverviewSummaryItemProps) {
  return (
    <div className="flex items-center gap-5 rounded-[16px] bg-[#f3f3f3] p-5">
      <div className="flex size-[50px] shrink-0 items-center justify-center">
        {icon}
      </div>
      <div className="flex min-w-0 flex-col gap-2.5">
        <span className="text-base leading-normal text-[#222]">{label}</span>
        <span className="font-display text-xl leading-normal text-[#185b50]">
          {value}
        </span>
      </div>
    </div>
  );
}
