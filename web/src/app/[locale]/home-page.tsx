import type { Locale } from "@/lib/i18n";
import { AiAssistantSection } from "@/components/sections/ai-assistant-section";
import { CustomerStoriesSection } from "@/components/sections/customer-stories-section";
import { DocsToolsSection } from "@/components/sections/docs-tools-section";
import { EnterpriseSection } from "@/components/sections/enterprise-section";
import { FeatureCardsSection } from "@/components/sections/feature-cards-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PhraseSlider } from "@/components/sections/phrase-slider";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialSection } from "@/components/sections/testimonial-section";

export default function HomePage({ locale: _locale }: { locale?: Locale } = {}) {
  return (
    <>
      <HeroSection />
      <PhraseSlider />
      <FeatureCardsSection />
      <TestimonialSection />
      <AiAssistantSection />
      <DocsToolsSection />
      <StatsSection />
      <EnterpriseSection />
      <CustomerStoriesSection />
    </>
  );
}
