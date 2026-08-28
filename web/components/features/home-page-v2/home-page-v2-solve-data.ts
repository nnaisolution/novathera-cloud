export type HomePageV2SolveCard = {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
};

export const homePageV2SolveCards: HomePageV2SolveCard[] = [
  {
    id: "advanced-diagnostics",
    category: "diagnostics",
    title: "Advanced Diagnostics",
    description:
      "Root-cause analysis through DNA, bioenergetic scanning, live blood & full-body composition.",
    image: "/home-page-v2/what-we-solve/advanced-diagnostics.png",
  },
  {
    id: "detoxification",
    category: "biohacking",
    title: "Detoxification",
    description:
      "BEFE detox baths, colon hydrotherapy, infrared & lymphatic drainage to reset the body.",
    image: "/home-page-v2/what-we-solve/detoxification.png",
  },
  {
    id: "pain-management",
    category: "regulated / msp",
    title: "Pain Management",
    description:
      "Chiropractic, acupuncture, RMT, PEMF and photobiomodulation for lasting relief.",
    image: "/home-page-v2/what-we-solve/pain-management.png",
  },
  {
    id: "weight-loss-body-contouring",
    category: "weight & body",
    title: "Weight Loss & Body Contouring",
    description:
      "Medically-supervised programs, fat reduction, cavitation & metabolic optimization.",
    image: "/home-page-v2/what-we-solve/weight-loss-body-contouring.png",
  },
  {
    id: "frequency-energy",
    category: "mind & movement",
    title: "Frequency & Energy",
    description:
      "BioCharger, sound healing, light frequency & BrainTap for cellular and neural optimization.",
    image: "/home-page-v2/what-we-solve/frequency-energy.png",
  },
  {
    id: "stress-sleep",
    category: "mind & movement",
    title: "Stress & Sleep",
    description:
      "Halotherapy salt room, yoga, mindfulness & mental health support for the nervous system.",
    image: "/home-page-v2/what-we-solve/stress-sleep.png",
  },
];
