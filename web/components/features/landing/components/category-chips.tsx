import { cn } from "@/lib/utils";

type CategoryChipsProps<T extends string> = {
  categories: readonly T[];
  active: T;
  onChange: (category: T) => void;
  className?: string;
};

export function CategoryChips<T extends string>({
  categories,
  active,
  onChange,
  className,
}: CategoryChipsProps<T>) {
  return (
    <div
      className={cn("flex flex-nowrap gap-2.5", className)}
      role="tablist"
      aria-label="Service categories"
    >
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          role="tab"
          aria-selected={active === cat}
          onClick={() => onChange(cat)}
          className={cn(
            "shrink-0 rounded-[40px] px-[30px] py-4 text-base whitespace-nowrap transition-colors",
            active === cat
              ? "bg-[#023a40] text-white"
              : "border border-[#023a40]/20 text-[#023a40] hover:bg-[#023a40]/5",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
