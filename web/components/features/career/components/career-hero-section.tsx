import { careerAssets } from "@/components/features/career/assets";
import { PageHeroBanner } from "@/components/shared/page-hero-banner";

export function CareerHeroSection() {
  return (
    <PageHeroBanner
      backgroundImage={careerAssets.heroBackground}
      tone="dark"
      contentPosition="center"
      heightClass="h-[800px] min-h-[800px]"
      withHomeHeader
      title="Career"
      description="Join Nova Thera and become part of a passionate team dedicated to wellness, innovation, and personalized care. We believe in growing together while making a meaningful impact in people's lives."
    />
  );
}
