"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import {
  useServiceCategories,
  useServiceFacets,
  useServices,
} from "../hooks/use-services";
import type { ServiceActiveFilters, ServiceFilterGroup } from "../types";
import { ServiceCard } from "./service-card";
import { ServiceFilterPanel } from "./service-filter-panel";

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ServiceListingCatalogSection() {
  const [activeFilters, setActiveFilters] = useState<ServiceActiveFilters>({});
  const servicesQuery = useServices(activeFilters);
  const categoriesQuery = useServiceCategories();
  const facetsQuery = useServiceFacets();

  const services = servicesQuery.data ?? [];
  const filtersLoading = categoriesQuery.isLoading || facetsQuery.isLoading;

  const allGroups: ServiceFilterGroup[] = [
    {
      id: "categoryId",
      label: "Category",
      options: (categoriesQuery.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
      })),
    },
    {
      id: "tags",
      label: "Focus Area",
      options: (facetsQuery.data?.tags ?? []).map((tag) => ({
        value: tag,
        label: capitalize(tag),
      })),
    },
  ];
  const filterGroups = allGroups.filter((group) => group.options.length > 0);

  return (
    <section className="bg-[#faf7ee] px-6 pt-16 pb-24 lg:px-20 lg:pt-20 lg:pb-40">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center gap-10">
        <div className="flex w-full flex-col gap-10 lg:flex-row lg:items-start lg:gap-5">
          {filtersLoading ? (
            <div className="flex w-full max-w-[300px] shrink-0 flex-col gap-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={index}
                  className="h-14 w-full animate-pulse rounded bg-[#edffe3]"
                />
              ))}
            </div>
          ) : filterGroups.length > 0 ? (
            <ServiceFilterPanel
              groups={filterGroups}
              activeFilters={activeFilters}
              onChange={setActiveFilters}
              className="shrink-0 lg:sticky lg:top-28"
            />
          ) : null}

          {servicesQuery.isLoading ? (
            <div
              className={cn(
                "grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
              )}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[385/491] animate-pulse rounded-[20px] bg-[#edffe3]"
                />
              ))}
            </div>
          ) : (
            <div className="grid w-full flex-1 grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>

        {!servicesQuery.isLoading && services.length === 0 ? (
          <p className="text-base text-[#546256]">
            No services match the selected filters.
          </p>
        ) : null}

        {servicesQuery.isError ? (
          <p className="text-base text-[#546256]">
            Unable to load services. Please try again shortly.
          </p>
        ) : null}
      </div>
    </section>
  );
}
