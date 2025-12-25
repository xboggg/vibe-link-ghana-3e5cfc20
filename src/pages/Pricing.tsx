import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { Check, X, Star, MessageCircle, Plus } from "lucide-react";
import SEO, { createBreadcrumbSchema } from "@/components/SEO";

const pricingBreadcrumb = createBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Pricing", url: "/pricing" },
]);

const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "VibeLink Digital Invitations",
  description: "Digital event invitations for weddings, funerals, naming ceremonies in Ghana",
  brand: {
    "@type": "Brand",
    name: "VibeLink Ghana",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter Vibe",
      price: "500",
      priceCurrency: "GHS",
      description: "Best for simple, intimate events",
    },
    {
      "@type": "Offer",
      name: "Classic Vibe",
      price: "1200",
      priceCurrency: "GHS",
      description: "Best for weddings, funerals, most events",
    },
    {
      "@type": "Offer",
      name: "Prestige Vibe",
      price: "2500",
      priceCurrency: "GHS",
      description: "Best for premium celebrations",
    },
    {
      "@type": "Offer",
      name: "Royal Vibe",
      price: "5000",
      priceCurrency: "GHS",
      description: "Best for exclusive, luxury events",
    },
  ],
};

// FAQ Schema for rich snippets
const pricingFAQs = [
  {
    question: "What is included in VibeLink digital invitations?",
    answer: "All packages include mobile-responsive design, countdown timer, Google Maps directions, and WhatsApp sharing. Higher packages add features like photo galleries, RSVP tracking, background music, and MoMo collection.",
  },
  {
    question: "How long does it take to create my digital invitation?",
    answer: "Standard delivery is 5-7 business days. We offer rush delivery (48 hours) for an additional GHS 300.",
  },
  {
    question: "Can I make changes after my invitation is created?",
    answer: "Yes! Starter package includes 1 revision round, Classic includes 2 rounds, and Prestige/Royal packages include unlimited revisions.",
  },
  {
    question: "How long will my invitation stay online?",
    answer: "Hosting duration varies by package: Starter (30 days), Classic (90 days), Prestige (1 year), and Royal (2 years). Extended hosting is available as an add-on.",
  },
  {
    question: "Can guests abroad access my digital invitation?",
    answer: "Absolutely! Your digital invitation works anywhere in the world. Guests can view it on any device with internet access and contribute via mobile money or international transfers.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFAQs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const packages = [
  {
    name: "Starter Vibe",
    price: "GHS 500",
    description: "Best for simple, intimate events",
    popular: false,
    features: [
      { name: "1 hero banner image", included: true },
      { name: "Pre-designed template", included: true },
      { name: "Event details section", included: true },
      { name: "Countdown timer", included: true },
      { name: "Google Maps directions", included: true },
      { name: "WhatsApp share button", included: true },
      { name: "Mobile responsive", included: true },
      { name: "30-day hosting", included: true },
      { name: "1 revision round", included: true },
      { name: "Photo gallery", included: false },
      { name: "Background music", included: false },
      { name: "RSVP tracking", included: false },
      { name: "MoMo collection", included: false },
    ],
  },
  {
    name: "Classic Vibe",
    price: "GHS 1,200",
    description: "Best for weddings, funerals, most events",
    popular: true,
    features: [
      { name: "2 hero banner images", included: true },
      { name: "Everything in Starter", included: true },
      { name: "Custom color scheme", included: true },
      { name: "Photo gallery (10 photos)", included: true },
      { name: "Background music", included: true },
      { name: "RSVP tracking", included: true },
      { name: "Add to calendar", included: true },
      { name: "Contact cards", included: true },
      { name: "90-day hosting", included: true },
      { name: "2 revision rounds", included: true },
      { name: "MoMo collection", included: false },
      { name: "Custom domain", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Prestige Vibe",
    price: "GHS 2,500",
    description: "Best for premium celebrations",
    popular: false,
    features: [
      { name: "3 hero banner images", included: true },
      { name: "Everything in Classic", included: true },
      { name: "Fully custom design", included: true },
      { name: "Unlimited photos", included: true },
      { name: "Video integration", included: true },
      { name: "MoMo contribution collection", included: true },
      { name: "Guest Messaging Wall", included: true },
      { name: "Post-event memorial page", included: true },
      { name: "Guest analytics dashboard", included: true },
      { name: "Custom domain option", included: true },
      { name: "1-year hosting", included: true },
      { name: "Unlimited revisions", included: true },
      { name: "Priority WhatsApp support", included: true },
    ],
  },
  {
    name: "Royal Vibe",
    price: "GHS 5,000+",
    description: "Best for exclusive, luxury events",
    popular: false,
    features: [
      { name: "5 hero banner images", included: true },
      { name: "Everything in Prestige", included: true },
      { name: "Multiple event pages", included: true },
      { name: "White-label (our brand removed)", included: true },
      { name: "Advanced animations", included: true },
      { name: "2-year hosting", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Professional consultation", included: true },
    ],
  },
];

// Comparison table data
const comparisonFeatures = [
  { feature: "Hero Banner Images", starter: "1", classic: "2", prestige: "3", royal: "5" },
  { feature: "Custom Color Scheme", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Photo Gallery", starter: false, classic: "10 photos", prestige: "Unlimited", royal: "Unlimited" },
  { feature: "Background Music", starter: false, classic: true, prestige: true, royal: true },
  { feature: "RSVP Tracking", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Countdown Timer", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Google Maps", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Add to Calendar", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Contact Cards", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Video Integration", starter: false, classic: false, prestige: true, royal: true },
  { feature: "MoMo Collection", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Guest Messaging Wall", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Post-event Memorial", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Guest Analytics", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Custom Domain", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Multiple Event Pages", starter: false, classic: false, prestige: false, royal: true },
  { feature: "White-label", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Advanced Animations", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Hosting Duration", starter: "30 days", classic: "90 days", prestige: "1 year", royal: "2 years" },
  { feature: "Revision Rounds", starter: "1", classic: "2", prestige: "Unlimited", royal: "Unlimited" },
  { feature: "Priority Support", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Dedicated Manager", starter: false, classic: false, prestige: false, royal: true },
];

const addOns = [
  { name: "Rush Delivery (48 hours)", price: "GHS 300" },
  { name: "Extra Revision Round", price: "GHS 100" },
  { name: "Extended Hosting (6 months)", price: "GHS 150" },
  { name: "Extended Hosting (1 year)", price: "GHS 300" },
  { name: "Custom Domain", price: "GHS 200/yr" },
  { name: "Video Background", price: "GHS 200" },
  { name: "Extra Photos (+10)", price: "GHS 100" },
  { name: "Additional Language Version", price: "GHS 150" },
  { name: "Live Stream Embed", price: "GHS 150" },
  { name: "Post-Event Thank You Page", price: "GHS 200" },
  { name: "Guest Messaging Wall", price: "GHS 150" },
  { name: "Photo Booth Frame", price: "GHS 100" },
  { name: "Event Timeline/Program Display", price: "GHS 100" },
  { name: "Memory Tribute Wall (funerals)", price: "GHS 200" },
  { name: "Bilingual (English + Twi)", price: "GHS 150" },
  { name: "Bilingual (English + French)", price: "GHS 150" },
  { name: "Memorial Page Annual Renewal", price: "GHS 100/yr" },
  { name: "Background Music", price: "GHS 50" },
  { name: "RSVP Tracking", price: "GHS 100" },
];

const Pricing = () => {
  const renderCellValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-accent mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
      );
    }
    return <span className="text-foreground font-medium">{value}</span>;
  };

  return (
    <Layout>
      <SEO 
        title="Pricing"
        description="Affordable digital invitation packages starting from GHS 500. Choose from Starter, Classic, or Premium packages for your wedding, funeral, or event in Ghana."
        keywords="digital invitation prices Ghana, wedding invitation cost, event invitation packages Accra"
        canonical="/pricing"
        jsonLd={[pricingSchema, pricingBreadcrumb, faqSchema]}
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Pricing
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              Choose the package that fits your celebration. No hidden fees,
              just beautiful invitations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-6 rounded-2xl border ${
                  pkg.popular
                    ? "border-secondary bg-card shadow-gold"
                    : "border-border bg-card"
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                      <Star className="h-3 w-3 fill-current" />
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-6 pt-2">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {pkg.description}
                  </p>
                  <div className="text-3xl font-bold text-foreground">
                    {pkg.price}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature.name}
                      className="flex items-center gap-2 text-sm"
                    >
                      {feature.included ? (
                        <Check className="h-4 w-4 text-accent flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={pkg.popular ? "gold" : "outline"}
                  className="w-full"
                >
                  <Link to="/get-started">
                    {pkg.name === "Royal Vibe" ? "Contact Us" : "Get Started"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Package Comparison Table */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Compare Packages
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See exactly what's included in each package to find your perfect fit.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-foreground font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">
                    Starter
                    <div className="text-sm font-normal text-muted-foreground">GHS 500</div>
                  </th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold bg-secondary/10 rounded-t-lg">
                    Classic
                    <div className="text-sm font-normal text-secondary">GHS 1,200</div>
                  </th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">
                    Prestige
                    <div className="text-sm font-normal text-muted-foreground">GHS 2,500</div>
                  </th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">
                    Royal
                    <div className="text-sm font-normal text-muted-foreground">GHS 5,000+</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border/50 ${
                      index % 2 === 0 ? "bg-card/50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 text-foreground text-sm">{row.feature}</td>
                    <td className="py-3 px-4 text-center">{renderCellValue(row.starter)}</td>
                    <td className="py-3 px-4 text-center bg-secondary/5">{renderCellValue(row.classic)}</td>
                    <td className="py-3 px-4 text-center">{renderCellValue(row.prestige)}</td>
                    <td className="py-3 px-4 text-center">{renderCellValue(row.royal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enhance Your Invitation
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Add extra features to make your digital invitation even more special.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {addOns.map((addon, index) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:border-secondary/50 transition-colors"
                >
                  <span className="text-foreground font-medium text-sm">{addon.name}</span>
                  <span className="text-secondary font-bold text-sm whitespace-nowrap ml-2">{addon.price}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MoMo Note */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">
              MoMo Collection Fees
            </h3>
            <p className="text-muted-foreground">
              For packages with MoMo contribution collection, we charge a 2.5%
              processing fee on funds collected. This covers payment processing,
              dashboard access, and support.
            </p>
          </div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center p-8 rounded-2xl bg-card border border-border"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Not sure which to choose?
            </h3>
            <p className="text-muted-foreground mb-6">
              Tell us about your event and we'll recommend the perfect package
              for you. No pressure, just helpful advice.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="default" size="lg">
                <Link to="/get-started">Get a Recommendation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://wa.me/233245817973"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Pricing;