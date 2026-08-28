import Image from "next/image";

import { BOOKING_PLACEHOLDER_IMAGE } from "@/components/features/booking/types";
import { cn } from "@/lib/utils";

type BookingConcernCategoryItemProps = {
  category: { id: string; name: string; iconUrl: string | null };
  selected: boolean;
  onSelect: (categoryId: string) => void;
};

export function BookingConcernCategoryItem({
  category,
  selected,
  onSelect,
}: BookingConcernCategoryItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="flex w-[100px] shrink-0 flex-col items-center gap-2.5"
    >
      <span
        className={cn(
          "relative size-[100px] overflow-hidden rounded-full bg-white",
          selected && "border border-[#185b50]",
        )}
      >
        <Image
          src={category.iconUrl ?? BOOKING_PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="100px"
        />
      </span>

      <span
        className={cn(
          "text-center text-sm leading-[1.3] font-semibold whitespace-nowrap",
          selected ? "text-[#185b50]" : "text-[#666]",
        )}
      >
        {category.name}
      </span>
    </button>
  );
}
