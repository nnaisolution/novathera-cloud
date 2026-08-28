import { Building2, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

type BookingClinicListItemProps = {
  location: {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    province: string;
  };
  selected: boolean;
  onSelect: (locationId: string) => void;
};

export function BookingClinicListItem({
  location,
  selected,
  onSelect,
}: BookingClinicListItemProps) {
  const address = [location.addressLine1, location.addressLine2]
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={() => onSelect(location.id)}
      className={cn(
        "flex h-[70px] w-full items-center gap-4 rounded-[16px] text-left transition-colors",
        selected
          ? "bg-white ring-1 ring-[#185b50]"
          : "hover:bg-white/70",
      )}
    >
      <span className="flex size-[70px] shrink-0 items-center justify-center rounded-full bg-[#edffe3]">
        <Building2
          className="size-6 text-[#185b50]"
          strokeWidth={1.5}
          aria-hidden
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="font-display text-xl leading-normal text-[#185b50]">
          {location.name}
        </span>
        <span className="flex items-center gap-1 text-base leading-[1.5] text-[#666]">
          <MapPin className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="truncate">
            {address}, {location.city}, {location.province}
          </span>
        </span>
      </span>
    </button>
  );
}
