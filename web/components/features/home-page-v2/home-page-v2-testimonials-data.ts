export type HomePageV2Testimonial = {
  id: string;
  quote: string;
  name: string;
  subtitle: string;
};

export const homePageV2TestimonialsRating = {
  score: 4.9,
  reviewCount: "2,300+",
} as const;

export const homePageV2Testimonials: HomePageV2Testimonial[] = [
  {
    id: "amara-okafor",
    quote:
      "Nova Thera completely changed how I think about wellness. The team listens — really listens.",
    name: "Amara Okafor",
    subtitle: "Member since 2023",
  },
  {
    id: "lea-marchand",
    quote:
      "My skin has never been calmer. The bespoke serum is genuinely magic.",
    name: "Léa Marchand",
    subtitle: "Skincare client",
  },
  {
    id: "priya-sharma",
    quote:
      "Finally a clinic that treats the whole person, not just the symptom.",
    name: "Priya Sharma",
    subtitle: "Wellness program",
  },
  {
    id: "sofia-reyes",
    quote:
      "From the first consultation, it felt like a sanctuary built around me.",
    name: "Sofía Reyes",
    subtitle: "Member since 2022",
  },
];
