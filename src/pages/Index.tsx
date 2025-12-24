import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { EventTypesSection } from "@/components/sections/EventTypesSection";
import { PortfolioPreviewSection } from "@/components/sections/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { HowItWorksPreviewSection } from "@/components/sections/HowItWorksPreviewSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <EventTypesSection />
      <PortfolioPreviewSection />
      <TestimonialsSection />
      <HowItWorksPreviewSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
