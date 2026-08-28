import { cn } from "@/lib/utils";

type BookingTimeSlotButtonProps = {
  time: string;
  selected: boolean;
  onSelect: (time: string) => void;
};

export function BookingTimeSlotButton({
  time,
  selected,
  onSelect,
}: BookingTimeSlotButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(time)}
      aria-pressed={selected}
      className={cn(
        "flex h-[46px] w-full items-center justify-center rounded-[16px] px-4 py-2.5 text-lg leading-[1.5] transition-colors",
        selected
          ? "bg-[#185b50] text-white"
          : "bg-[#f3f3f3] text-[#222] hover:bg-[#e8e8e8]",
      )}
    >
      {time}
    </button>
  );
}
