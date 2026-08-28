import Image from "next/image";

import { homePageV2InstagramImages } from "@/components/features/home-page-v2/home-page-v2-instagram-data";

function InstagramImageTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      className="flex shrink-0 items-center gap-5"
      aria-hidden={ariaHidden}
    >
      {homePageV2InstagramImages.map((image) => (
        <div
          key={image.id}
          className="relative size-[200px] shrink-0 overflow-hidden rounded-[20px] sm:size-[250px]"
        >
          <Image
            src={image.src}
            alt={ariaHidden ? "" : image.alt}
            fill
            className="object-cover"
            sizes="250px"
          />
        </div>
      ))}
    </div>
  );
}

export function HomePageV2InstagramCarousel() {
  return (
    <div
      className="w-full overflow-hidden"
      aria-label="Nova Thera Instagram gallery"
    >
      <div className="home-page-v2-instagram-marquee flex w-max">
        <InstagramImageTrack />
        <InstagramImageTrack ariaHidden />
      </div>
    </div>
  );
}
