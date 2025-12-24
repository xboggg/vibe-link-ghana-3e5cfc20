import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { Check, X, Star, MessageCircle } from "lucide-react";

const packages = [
  {
    name: "Starter Vibe",
    price: "GHS 500",
    description: "Best for simple, intimate events",
    popular: false,
    features: [
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
      { name: "Everything in Classic", included: true },
      { name: "Fully custom design", included: true },
      { name: "Unlimited photos", included: true },
      { name: "Video integration", included: true },
      { name: "MoMo contribution collection", included: true },
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
      { name: "Everything in Prestige", included: true },
      { name: "Multiple event pages", included: true },
      { name: "White-label (our brand removed)", included: true },
      { name: "Advanced animations", included: true },
      { name: "Lifetime hosting", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Post-event memorial page", included: true },
      { name: "Professional consultation", included: true },
    ],
  },
];

const faqs = [
  {
    question: "Can I upgrade my package later?",
    answer: "Yes! You can upgrade anytime before your invitation goes live. We'll adjust the pricing accordingly.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfer, and cash payments in Accra.",
  },
  {
    question: "Is the MoMo collection fee separate?",
    answer: "Yes, we charge a 2.5% processing fee on funds collected through MoMo. This covers payment processing and dashboard access.",
  },
];

const Pricing = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-16 bg-gradient-to-b from-navy to-navy-light">
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
                  href="https://wa.me/233XXXXXXXXX"
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
