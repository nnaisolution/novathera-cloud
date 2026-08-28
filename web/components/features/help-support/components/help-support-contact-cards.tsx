import { Mail, MapPin, Phone } from "lucide-react";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Email us",
    primary: "marketing@novathera.ca",
    secondary: "We reply within 24 hours",
  },
  {
    icon: Phone,
    label: "Call us",
    primary: "+1 (212) 123-4567",
    secondary: "Mon–Sat, 9am – 7pm EST",
  },
  {
    icon: MapPin,
    label: "Visit us",
    primary: "156 Chrislea Rd, Woodbridge",
    secondary: "Ontario",
  },
];

export function HelpSupportContactCards() {
  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
      {CONTACT_CHANNELS.map((channel) => (
        <div
          key={channel.label}
          className="flex flex-col items-start gap-5 rounded-[28px] border border-[#d8d8cd] bg-white p-10"
        >
          <channel.icon className="size-8 text-[#d79628]" aria-hidden />
          <div className="flex flex-col items-start gap-3">
            <p className="text-xs tracking-[2.4px] text-[#546256] uppercase">
              {channel.label}
            </p>
            <p className="font-serif text-xl text-[#0c1f13]">
              {channel.primary}
            </p>
            <p className="font-serif text-xl text-[#0c1f13]">
              {channel.secondary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
