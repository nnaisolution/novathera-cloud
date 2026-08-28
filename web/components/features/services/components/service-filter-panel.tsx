"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { ServiceActiveFilters, ServiceFilterGroup } from "../types";

export function ServiceFilterPanel({
  groups,
  activeFilters,
  onChange,
  className,
}: {
  groups: ServiceFilterGroup[];
  activeFilters: ServiceActiveFilters;
  onChange: (filters: ServiceActiveFilters) => void;
  className?: string;
}) {
  const [openFacetId, setOpenFacetId] = useState<
    ServiceFilterGroup["id"] | null
  >(null);

  function toggleFacet(facetId: ServiceFilterGroup["id"]) {
    setOpenFacetId((current) => (current === facetId ? null : facetId));
  }

  function toggleOption(facetId: ServiceFilterGroup["id"], value: string) {
    const current = activeFilters[facetId] ?? [];
    // categoryId is single-select (the backend only accepts one); tags are multi-select.
    const next =
      facetId === "categoryId"
        ? current.includes(value)
          ? []
          : [value]
        : current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];

    onChange({ ...activeFilters, [facetId]: next });
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
                <ChevronRight
                  className={cn(
                    "size-4 text-[#666] transition-transform",
                    isOpen && "rotate-90",
                  )}
                  aria-hidden
                />
              </button>

              {isOpen ? (
                <ul className="flex flex-col gap-3 pb-5">
                  {group.options.map((option) => {
                    const checked = selected.includes(option.value);
                    return (
                      <li key={option.value}>
                        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#185b50]">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleOption(group.id, option.value)}
                            className="size-4 accent-[#185b50]"
                          />
                          <span>{option.label}</span>
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
