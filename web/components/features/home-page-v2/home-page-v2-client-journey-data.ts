export type HomePageV2ClientJourneyStep = {
  id: string;
  number: string;
  title: string;
  description: string;
};

export const homePageV2ClientJourneySteps: HomePageV2ClientJourneyStep[] = [
  {
    id: "beauty-entry",
    number: "01",
    title: "Beauty Entry",
    description:
      "A low-friction first visit hair, facial, or aesthetic service where trust is built and wellness curiosity begins.",
  },
  {
    id: "wellness-discovery",
    number: "02",
    title: "Wellness Discovery",
    description:
      'Body composition & bioenergetic scanning reveal root causes. Move from "look better" to "understand within."',
  },
  {
    id: "protocol-enrolment",
    number: "03",
    title: "Protocol Enrolment",
    description:
      "A customized 3–6 month plan with diagnostics, IV, detox and advanced pathways toward measurable change.",
  },
  {
    id: "thrive-membership",
    number: "04",
    title: "Thrive Membership",
    description:
      "Graduate into maintenance: priority booking, supplement credits, wearables & lifelong optimization.",
  },
];
