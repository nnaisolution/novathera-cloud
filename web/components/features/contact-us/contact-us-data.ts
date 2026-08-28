import { contactUsAssets } from "@/components/features/contact-us/assets";

export const contactHeroCopy = {
  eyebrow: "Get in touch",
  headlineBefore: "We'd love to ",
  headlineAccent: "hear",
  headlineAfter: " from you.",
  body: "Whether you're ready to book, have a question, or just want to learn more — our team is here to help.",
} as const;

export const contactChannels = [
  {
    id: "visit",
    icon: "◎",
    label: "Visit us",
    lines: ["156 Chrisley road Vaughan", "Ontario"],
    href: "https://maps.google.com/?q=156+Chrislea+Rd,+Woodbridge,+ON",
  },
  {
    id: "call",
    icon: "☎",
    label: "Call us",
    lines: ["+1 (212) 123-4567", "Mon–Sat, 9am – 7pm EST"],
    href: "tel:+12121234567",
  },
  {
    id: "email",
    icon: "✉",
    label: "Email us",
    lines: ["marketing@novathera.ca", "We reply within 24 hours"],
    href: "mailto:marketing@novathera.ca",
  },
] as const;

export const contactGalleryImages = [
  {
    id: "products",
    src: contactUsAssets.gallery.wellnessProducts,
    alt: "Nova Thera wellness and skincare products",
  },
  {
    id: "treatment",
    src: contactUsAssets.gallery.treatmentRoom,
    alt: "Client receiving a wellness treatment",
  },
] as const;

export const contactConsultationCopy = {
  eyebrow: "Book a consultation",
  headlineBefore: "Start your ",
  headlineAccent: "wellness journey",
  headlineAfter: " today",
  body: "Fill out the form and our team will reach out within 24 hours to schedule your complimentary diagnostic consultation.",
  benefits: [
    "Free 30-minute diagnostic",
    "Personalized protocol design",
    "No commitment required",
  ],
  submit: "Request consultation",
  submitting: "Sending…",
} as const;

export const contactFaqs = [
  {
    id: "book-first",
    question: "How do I book my first appointment?",
    answer:
      "Simply fill out the contact form below or call us directly. New members receive a complimentary 30-minute diagnostic consultation.",
  },
  {
    id: "first-visit",
    question: "What should I expect during my first visit?",
    answer:
      "You'll meet with a practitioner for a full diagnostic consultation covering your goals, history, and recommended protocols — complimentary for new members and with no commitment required.",
  },
  {
    id: "virtual",
    question: "Do you offer virtual consultations?",
    answer:
      "Yes. Select a virtual consultation preference in your message or call us, and our team will arrange a remote session that fits your schedule.",
  },
  {
    id: "cancellation",
    question: "What is your cancellation policy?",
    answer:
      "Please provide at least 24 hours' notice for cancellations or reschedules so we can offer your time to another member. Late cancellations may be subject to a fee.",
  },
  {
    id: "products-online",
    question: "Are your products available for purchase online?",
    answer:
      "Select products are available through our clinic and member programs. Contact us or visit the shop for current availability and shipping options.",
  },
] as const;

export const contactVisitCtaCopy = {
  headlineBefore: "Prefer to ",
  headlineAccent: "visit?",
  body: "Our flagship clinic at 156 Chrisley road Vaughan, Ontario is open six days a week. Walk-ins welcome for product browsing and member services.",
  primaryCta: "Call now",
  secondaryCta: "Learn about us",
  phoneHref: "tel:+12121234567",
} as const;
