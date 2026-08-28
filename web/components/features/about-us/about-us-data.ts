import { aboutUsAssets } from "@/components/features/about-us/assets";

export const aboutHeroCopy = {
  eyebrow: "About Nova Thera",
  headlineBefore: "A sanctuary built on ",
  headlineAccent: "purpose.",
  body: "At Nova Thera, we believe that confidence begins with feeling your best—inside and out. We are a modern wellness and advanced treatment clinic dedicated to helping individuals achieve healthier, more confident lives through personalized, science-backed solutions.",
} as const;

export const aboutStoryCopy = {
  eyebrow: "Our story",
  headline: "Redefining Wellness Through Science, Care & Transformation",
  paragraphs: [
    "Our approach combines innovative technologies, evidence-based treatments, and compassionate care to deliver real, visible results. From hair restoration and body sculpting to skin rejuvenation and overall wellness services, every treatment is carefully tailored to meet your unique goals, concerns, and lifestyle.",
    "We understand that no two journeys are the same. That's why we take the time to listen, educate, and create customized treatment plans that empower our clients to make informed decisions about their health and well-being.",
    "At Nova Thera, we are more than a treatment provider—we are your trusted partner in transformation. Our mission is to create a welcoming and supportive environment where advanced care meets human connection, helping every individual look better, feel better, and live with renewed confidence.",
  ],
  badges: ["Founded 2018", "NYC flagship", "12,000+ members"],
} as const;

export const aboutPrinciples = [
  {
    number: "01",
    title: "Personalized Care",
    description: "Solutions designed around your unique needs and goals.",
  },
  {
    number: "02",
    title: "Advanced Technology",
    description:
      "Innovative treatments backed by science and proven methodologies.",
  },
  {
    number: "03",
    title: "Visible Results",
    description:
      "A commitment to delivering outcomes that make a meaningful difference.",
  },
  {
    number: "04",
    title: "Holistic Wellness",
    description:
      "Focusing on long-term confidence, health, and overall well-being.",
  },
] as const;

export const aboutStats = [
  { value: "40+", label: "integrated modalities" },
  { value: "16", label: "treatment suites" },
  { value: "MSP+", label: "private-pay billing" },
  { value: "7", label: "Systems of transformation" },
] as const;

export const aboutTeamMembers = [
  {
    id: "amara-okafor",
    name: "Dr. Amara Okafor",
    role: "Chief Dermatologist",
    bio: "Specializes in melanin-rich skin diagnostics and barrier restoration.",
    image: aboutUsAssets.team.amaraOkafor,
  },
  {
    id: "lea-marchand",
    name: "Léa Marchand",
    role: "Head of Wellness",
    bio: "Designs holistic protocols bridging nutrition, movement, and stress resilience.",
    image: aboutUsAssets.team.leaMarchand,
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    role: "Lead Aesthetician",
    bio: "Pioneered Nova Thera's signature bio-therapeutic facial methodology.",
    image: aboutUsAssets.team.priyaSharma,
  },
  {
    id: "james-okonkwo",
    name: "James Okonkwo",
    role: "Clinical Research Lead",
    bio: "Drives our treatment innovation pipeline and partnership with leading research labs.",
    image: aboutUsAssets.team.jamesOkonkwo,
  },
] as const;

export const aboutCtaCopy = {
  headlineBefore: "Ready to begin your ",
  headlineAccent: "ritual?",
  body: "Book a complimentary consultation and discover what personalized wellness feels like.",
  primaryCta: "Book a consultation",
  secondaryCta: "Explore services",
} as const;
