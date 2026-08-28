import Image from "next/image";

import { BOOKING_PLACEHOLDER_IMAGE } from "@/components/features/booking/types";
import { cn } from "@/lib/utils";

type BookingConcernListItemProps = {
  service: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  selected: boolean;
  onSelect: (serviceId: string) => void;
};

export function BookingConcernListItem({
  service,
  selected,
  onSelect,
}: BookingConcernListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service.id)}
      className={cn(
        "flex w-full items-center gap-5 rounded-[16px] bg-[#f3f3f3] px-5 py-2.5 text-left transition-colors",
        selected && "ring-1 ring-[#185b50]",
      )}
    >
      <span className="relative size-[50px] shrink-0 overflow-hidden rounded-full bg-white">
        <Image
          src={service.imageUrl ?? BOOKING_PLACEHOLDER_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50px"
        />
      </span>
      <span
        className={cn(
          "text-base leading-[1.5] font-semibold",
          selected ? "text-[#185b50]" : "text-[#666]",
        )}
      >
        {service.name}
      </span>
    </button>
  );
}
