import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { EventTypesSection } from "@/components/sections/EventTypesSection";
import { PortfolioPreviewSection } from "@/components/sections/PortfolioPreviewSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { HowItWorksPreviewSection } from "@/components/sections/HowItWorksPreviewSection";
import { CTASection } from "@/components/sections/CTASection";
import SEO, { createServiceSchema } from "@/components/SEO";

const homePageServices = [
  { name: "Wedding Invitations", description: "Beautiful digital invitations for traditional and white weddings in Ghana" },
  { name: "Funeral Programs", description: "Dignified memorial pages that honor your loved ones with respect" },
  { name: "Naming Ceremonies", description: "Celebrate the arrival of new life with joyful digital invitations" },
  { name: "Graduation Celebrations", description: "Share academic achievements with family and friends" },
  { name: "Corporate Events", description: "Professional digital invitations for conferences and corporate events" },
];

const Index = () => {
  return (
    <Layout>
      <SEO 
        title="VibeLink Events | Digital Event Invitations for Weddings, Funerals & More"
        description="Ghana's premier digital invitation service. Create stunning interactive invitations for weddings, funerals, naming ceremonies, graduations & corporate events. Share via WhatsApp!"
        canonical="/"
        jsonLd={createServiceSchema(homePageServices)}
      />
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
