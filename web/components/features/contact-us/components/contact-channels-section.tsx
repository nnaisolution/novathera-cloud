import Image from "next/image";

import { ContactChannelCard } from "@/components/features/contact-us/components/contact-channel-card";
import {
  contactChannels,
  contactGalleryImages,
} from "@/components/features/contact-us/contact-us-data";
import { cn } from "@/lib/utils";

type ContactChannelsSectionProps = {
  className?: string;
};

export function ContactChannelsSection({
  className,
}: ContactChannelsSectionProps) {
  return (
    <section
      className={cn(
        "bg-[#faf7ee] px-6 py-16 lg:px-[200px] lg:py-24",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {contactChannels.map((channel) => (
            <ContactChannelCard
              key={channel.id}
              icon={channel.icon}
              label={channel.label}
              lines={channel.lines}
              href={channel.href}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contactGalleryImages.map((image) => (
            <div
              key={image.id}
              className="relative h-[280px] overflow-hidden rounded-[28px] sm:h-[360px] lg:h-[400px]"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
