"use client";

import Image from "next/image";
import { useState } from "react";

import { shopAssets } from "@/components/features/shop/assets";
import type { ShopActiveFilters } from "@/components/features/shop/shop-data";
import type { ShopFilterGroup } from "@/components/features/shop/types";
import { cn } from "@/lib/utils";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ShopFilterPanelProps = {
  groups: ShopFilterGroup[];
  activeFilters: ShopActiveFilters;
  onChange: (filters: ShopActiveFilters) => void;
  className?: string;
};

export function ShopFilterPanel({
  groups,
  activeFilters,
  onChange,
  className,
}: ShopFilterPanelProps) {
  const [openFacetId, setOpenFacetId] = useState<ShopFilterGroup["id"] | null>(
    null,
  );

  function toggleFacet(facetId: ShopFilterGroup["id"]) {
    setOpenFacetId((current) => (current === facetId ? null : facetId));
  }

  function toggleOption(facetId: ShopFilterGroup["id"], option: string) {
    const current = activeFilters[facetId] ?? [];
    const next = current.includes(option)
      ? current.filter((value) => value !== option)
      : [...current, option];

    onChange({
      ...activeFilters,
      [facetId]: next,
    });
  }

  return (
    <aside className={cn("flex w-full max-w-[300px] flex-col gap-5", className)}>
      <p className="text-xl font-semibold tracking-wide text-[#222] uppercase">
        Filters
      </p>

      <div className="flex flex-col">
        {groups.map((group) => {
          const isOpen = openFacetId === group.id;
          const selected = activeFilters[group.id] ?? [];

          return (
            <div key={group.id} className="border-b border-[#ccc]">
              <button
                type="button"
                onClick={() => toggleFacet(group.id)}
                className="flex w-full items-center justify-between py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-base font-semibold tracking-wide text-[#666] uppercase">
                  {group.label}
                </span>
                <Image
                  src={shopAssets.icons.chevron}
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                  className={cn(
                    "size-4 transition-transform",
                    isOpen && "rotate-90",
                  )}
                />
              </button>

              {isOpen ? (
                <ul className="flex flex-col gap-3 pb-5">
                  {group.options.map((option) => {
                    const checked = selected.includes(option);
                    return (
                      <li key={option}>
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#185b50]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOption(group.id, option)}
                            className="size-4 accent-[#185b50]"
                          />
                          <span>{capitalize(option)}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
