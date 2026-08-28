import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { ServiceSummary } from "../types";
import { serviceRoutes } from "../utils/service-routes";

function formatServicePrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function ServiceCardBody({
  service,
  textClassName,
}: {
  service: ServiceSummary;
  textClassName: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", textClassName)}>
      <div className="flex items-end justify-between gap-2.5 text-xl uppercase">
        <p className="min-w-0 flex-1 truncate">{service.name}</p>
        <p className="shrink-0 whitespace-nowrap">
          {formatServicePrice(service.standardPriceCents, service.currency)}
        </p>
      </div>
      {service.shortDescription ? (
        <p className="line-clamp-2 text-sm opacity-80">
          {service.shortDescription}
        </p>
      ) : null}
    </div>
  );
}

export function ServiceCard({
  service,
  className,
}: {
  service: ServiceSummary;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-[20px] bg-[#edffe3]",
        className,
      )}
    >
      <Link
        href={serviceRoutes.detail(service.slug)}
        className="relative block aspect-[385/491] w-full overflow-hidden rounded-[10px] bg-white"
      >
        {service.imageUrl ? (
          <>
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              unoptimized={service.imageUrl.startsWith("http")}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 385px"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/40 to-transparent px-5 pt-10 pb-5">
              <ServiceCardBody service={service} textClassName="text-white" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col justify-end px-5 pt-10 pb-5">
            <ServiceCardBody service={service} textClassName="text-[#185b50]" />
          </div>
        )}

        {service.category ? (
          <span className="pointer-events-none absolute top-5 left-5 z-10 flex h-10 items-center rounded-[40px] bg-white px-5 text-base text-[#185b50]">
            {service.category.name}
          </span>
        ) : null}
      </Link>
    </article>
  );
}
