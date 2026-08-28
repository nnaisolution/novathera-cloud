import type { Metadata } from "next";

import { ComingSoonPageView } from "@/components/features/coming-soon";

export const metadata: Metadata = {
  title: "Nova Thera — System Enhancement in Progress",
  description:
    "We are upgrading our online experience to deliver a higher standard of digital wellness tracking, insights, and care. Sign up for launch updates.",
  openGraph: {
    title: "Nova Thera — Coming Soon",
    description:
      "A higher standard of digital wellness tracking, insights, and care.",
  },
};

export default function ComingSoonPage() {
  return <ComingSoonPageView />;
}
