import Image from "next/image";
import Link from "next/link";

import { siteNavigation } from "@/components/shared/site-navigation";
import type { ServiceDetail } from "../types";

export function ServiceDetailHero({ service }: { service: ServiceDetail }) {
  return (
    <section className="relative flex items-end justify-center overflow-hidden pt-[200px] pb-20 lg:pt-[300px]">
      {service.imageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={service.imageUrl}
            alt=""
            fill
            unoptimized={service.imageUrl.startsWith("http")}
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#edffe3]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#faf7ee] via-[#faf7ee]/50 to-[#faf7ee]/0" />

      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-start gap-6 px-6 lg:px-10">
        <div className="flex items-center gap-2.5 text-base text-black">
          <Link href={siteNavigation.home} className="hover:underline">
            Home
          </Link>
          <span>/</span>
          <Link href={siteNavigation.services} className="hover:underline">
            Services
          </Link>
          <span>/</span>
          <span className="opacity-50">{service.name}</span>
        </div>

        <div className="flex flex-col items-start gap-2.5">
          <h1 className="font-serif text-5xl leading-none text-[#185b50] lg:text-[72px]">
            {service.name}
          </h1>
          {service.shortDescription ? (
            <p className="max-w-[504px] text-lg text-[#546256]">
              {service.shortDescription}
            </p>
          ) : null}
        </div>

        <Link
          href={siteNavigation.book}
          className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(114deg,#f3b94c_0%,#e0991a_25%,#d68900_33%,#cb7a00_50%,#d68900_67%,#e0991a_75%,#f3b94c_100%)] px-7 py-4 text-lg font-semibold text-black transition-opacity hover:opacity-90"
        >
          Book this treatment
        </Link>
      </div>
    </section>
  );
}
