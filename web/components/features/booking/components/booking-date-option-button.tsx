import type { BookingDateOption } from "@/components/features/booking/utils/booking-slot-dates";
import { cn } from "@/lib/utils";

type BookingDateOptionButtonProps = {
  option: BookingDateOption;
  selected: boolean;
  onSelect: (value: string) => void;
};

export function BookingDateOptionButton({
  option,
  selected,
  onSelect,
}: BookingDateOptionButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.value)}
      aria-pressed={selected}
      className={cn(
        "flex min-w-[62px] flex-1 flex-col items-center justify-center gap-2.5 rounded-[16px] px-4 py-2.5 transition-colors",
        selected
          ? "bg-[#185b50] text-white"
          : "bg-[#f3f3f3] text-[#222]",
      )}
    >
      <span className="text-base leading-[1.5]">{option.dayLabel}</span>
      <span
        className={cn(
          "font-display text-2xl leading-normal",
          selected ? "text-white" : "text-[#185b50]",
        )}
      >
        {option.dayNumber}
      </span>
    </button>
  );
}
