import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { Check, X, Star, MessageCircle, Plus, Sparkles } from "lucide-react";
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

const packages = [
  {
    name: "Starter Vibe",
    price: "GHS 500",
    description: "Simple, intimate events",
    popular: false,
    color: "border-border",
    features: [
      { name: "1 hero banner image", included: true },
      { name: "Pre-designed template", included: true },
      { name: "Event details section", included: true },
      { name: "Countdown timer", included: true },
      { name: "Google Maps integration", included: true },
      { name: "WhatsApp share button", included: true },
      { name: "Mobile responsive", included: true },
      { name: "30-day hosting", included: true },
      { name: "1 revision round", included: true },
    ],
    excluded: ["Photo gallery", "RSVP tracking", "Background music"],
  },
  {
    name: "Classic Vibe",
    price: "GHS 1,200",
    description: "Weddings, funerals & more",
    popular: true,
    color: "border-secondary",
    features: [
      { name: "2 hero banner images", included: true },
      { name: "Everything in Starter", included: true, highlight: true },
      { name: "Custom color scheme", included: true },
      { name: "Photo gallery (15 photos)", included: true },
      { name: "Background music", included: true },
      { name: "RSVP tracking", included: true },
      { name: "Add to calendar button", included: true },
      { name: "Contact cards (vCard)", included: true },
      { name: "90-day hosting", included: true },
      { name: "2 revision rounds", included: true },
    ],
    excluded: ["Video integration", "MoMo collection"],
  },
  {
    name: "Prestige Vibe",
    price: "GHS 2,500",
    description: "Premium celebrations",
    popular: false,
    color: "border-primary/50",
    features: [
      { name: "3 hero banner images", included: true },
      { name: "Everything in Classic", included: true, highlight: true },
      { name: "Fully custom design", included: true },
      { name: "Unlimited photos", included: true },
      { name: "Video integration", included: true },
      { name: "MoMo collection (display)", included: true },
      { name: "Guest messaging wall", included: true },
      { name: "Custom domain option", included: true },
      { name: "1-year hosting", included: true },
      { name: "Unlimited revisions", included: true },
      { name: "Priority WhatsApp support", included: true },
    ],
    excluded: [],
  },
  {
    name: "Royal Vibe",
    price: "GHS 5,000+",
    description: "Exclusive, luxury events",
    popular: false,
    color: "border-amber-500/50",
    features: [
      { name: "5 hero banner images", included: true },
      { name: "Everything in Prestige", included: true, highlight: true },
      { name: "Multiple event pages", included: true },
      { name: "White-label (no branding)", included: true },
      { name: "Advanced animations", included: true },
      { name: "MoMo tracking dashboard", included: true },
      { name: "Program booklet page", included: true },
      { name: "Host dashboard", included: true },
      { name: "2-year hosting", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Professional consultation", included: true },
    ],
    excluded: [],
  },
];

const addOns = [
  { name: "RSVP Tracking", price: "GHS 100", desc: "For Starter package" },
  { name: "Video Integration", price: "GHS 200", desc: "Add video to any package" },
  { name: "MoMo Tracking Dashboard", price: "GHS 200", desc: "For Prestige package" },
  { name: "Program Booklet Page", price: "GHS 150", desc: "For Prestige package" },
  { name: "Host Dashboard", price: "GHS 200", desc: "For Prestige package" },
  { name: "Event Statistics", price: "GHS 200", desc: "Analytics & insights" },
  { name: "QR Check-in System", price: "GHS 150", desc: "Guest attendance tracking" },
  { name: "Digital Guestbook", price: "GHS 150", desc: "Guest messages & photos" },
  { name: "Gift Acknowledgment Page", price: "GHS 150", desc: "Thank contributors" },
  { name: "Live Stream Embed", price: "GHS 200", desc: "Stream your event" },
  { name: "Extended Hosting (6 months)", price: "GHS 250", desc: "Additional hosting" },
  { name: "Extended Hosting (1 year)", price: "GHS 500", desc: "Additional hosting" },
  { name: "Express Delivery (24h)", price: "GHS 500", desc: "Rush service" },
  { name: "Custom Domain", price: "GHS 200/yr", desc: "yourname.com" },
  { name: "Extra Photos (+15)", price: "GHS 100", desc: "More gallery space" },
  { name: "Additional Language", price: "GHS 150", desc: "Twi, French, etc." },
  { name: "Background Music", price: "GHS 50", desc: "For Starter package" },
  { name: "Memorial Page Renewal", price: "GHS 100/yr", desc: "Keep memorial alive" },
];

const comparisonFeatures = [
  { feature: "Hero Banner Images", starter: "1", classic: "2", prestige: "3", royal: "5" },
  { feature: "Custom Color Scheme", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Photo Gallery", starter: false, classic: "15", prestige: "Unlimited", royal: "Unlimited" },
  { feature: "Background Music", starter: false, classic: true, prestige: true, royal: true },
  { feature: "RSVP Tracking", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Countdown Timer", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Google Maps", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Add to Calendar", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Video Integration", starter: false, classic: false, prestige: true, royal: true },
  { feature: "MoMo Collection", starter: false, classic: false, prestige: "Display", royal: "Tracking" },
  { feature: "Guest Messaging Wall", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Custom Domain", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Program Booklet", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Host Dashboard", starter: false, classic: false, prestige: false, royal: true },
  { feature: "White-label", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Hosting Duration", starter: "30 days", classic: "90 days", prestige: "1 year", royal: "2 years" },
  { feature: "Revisions", starter: "1", classic: "2", prestige: "Unlimited", royal: "Unlimited" },
  { feature: "Delivery Time", starter: "5-7 days", classic: "5-7 days", prestige: "5-7 days", royal: "5-7 days" },
];

const Pricing = () => {
  const renderCellValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-4 w-4 text-green-500 mx-auto" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
      );
    }
    return <span className="text-foreground text-xs sm:text-sm font-medium">{value}</span>;
  };

  return (
    <Layout>
      <SEO
        title="Pricing"
        description="Affordable digital invitation packages starting from GHS 500. Choose from Starter, Classic, Prestige or Royal packages for your wedding, funeral, or event in Ghana."
        keywords="digital invitation prices Ghana, wedding invitation cost, event invitation packages Accra"
        canonical="/pricing"
        jsonLd={[pricingSchema, pricingBreadcrumb]}
      />

      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Simple Pricing
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Choose Your Perfect Package
            </h1>
            <p className="text-primary-foreground/80 text-base lg:text-lg">
              Beautiful digital invitations for every budget. No hidden fees.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative p-5 rounded-2xl border-2 ${pkg.color} bg-card ${
                  pkg.popular ? "shadow-xl ring-2 ring-secondary/20" : "hover:shadow-lg"
                } transition-all duration-300`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-lg">
                      <Star className="h-3 w-3 fill-current" />
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-4 pt-1">
                  <h3 className="text-lg font-bold text-foreground">{pkg.name}</h3>
                  <p className="text-muted-foreground text-xs mb-3">{pkg.description}</p>
                  <div className="text-2xl lg:text-3xl font-bold text-foreground">{pkg.price}</div>
                </div>

                <ul className="space-y-2 mb-5">
                  {pkg.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-2 text-xs lg:text-sm">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${feature.highlight ? "text-secondary" : "text-green-500"}`} />
                      <span className={feature.highlight ? "text-secondary font-medium" : "text-foreground"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                  {pkg.excluded.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs lg:text-sm">
                      <X className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground/60">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={pkg.popular ? "gold" : "outline"}
                  className="w-full"
                  size="sm"
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

      {/* Comparison Table */}
      <section className="py-12 lg:py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Compare Packages</h2>
            <p className="text-muted-foreground text-sm">
              Find your perfect fit at a glance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto rounded-xl border border-border bg-card"
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-3 text-foreground font-semibold text-sm">Feature</th>
                  <th className="text-center py-3 px-2 text-foreground font-semibold text-xs sm:text-sm min-w-[70px]">
                    <div>Starter</div>
                    <div className="text-xs font-normal text-muted-foreground">GHS 500</div>
                  </th>
                  <th className="text-center py-3 px-2 font-semibold text-xs sm:text-sm bg-secondary/10 min-w-[70px]">
                    <div className="text-secondary">Classic</div>
                    <div className="text-xs font-normal text-secondary/80">GHS 1,200</div>
                  </th>
                  <th className="text-center py-3 px-2 text-foreground font-semibold text-xs sm:text-sm min-w-[70px]">
                    <div>Prestige</div>
                    <div className="text-xs font-normal text-muted-foreground">GHS 2,500</div>
                  </th>
                  <th className="text-center py-3 px-2 text-foreground font-semibold text-xs sm:text-sm min-w-[70px]">
                    <div>Royal</div>
                    <div className="text-xs font-normal text-muted-foreground">GHS 5,000+</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-border/50 ${index % 2 === 0 ? "bg-background/50" : ""}`}
                  >
                    <td className="py-2.5 px-3 text-foreground text-xs sm:text-sm">{row.feature}</td>
                    <td className="py-2.5 px-2 text-center">{renderCellValue(row.starter)}</td>
                    <td className="py-2.5 px-2 text-center bg-secondary/5">{renderCellValue(row.classic)}</td>
                    <td className="py-2.5 px-2 text-center">{renderCellValue(row.prestige)}</td>
                    <td className="py-2.5 px-2 text-center">{renderCellValue(row.royal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Enhance Your Invitation
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Add extra features to make your invitation even more special
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {addOns.map((addon, index) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border hover:border-primary/30 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-foreground font-medium text-sm block truncate">{addon.name}</span>
                    <span className="text-muted-foreground text-xs">{addon.desc}</span>
                  </div>
                  <span className="text-primary font-bold text-sm whitespace-nowrap ml-3 group-hover:text-secondary transition-colors">
                    {addon.price}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Payment Plans */}
      <section className="py-10 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-foreground mb-2">Flexible Payment Plans</h3>
              <p className="text-muted-foreground text-sm">Choose how you want to pay</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { plan: "Full Payment", split: "100%", note: "Save the Date in 24h" },
                { plan: "50/50 Split", split: "50% + 50%", note: "Balance before delivery" },
                { plan: "40/60 Split", split: "40% + 60%", note: "Balance before delivery" },
                { plan: "30/70 Split", split: "30% + 70%", note: "Balance before delivery" },
              ].map((item) => (
                <div
                  key={item.plan}
                  className="p-3 rounded-lg bg-card border border-border text-center"
                >
                  <div className="text-lg font-bold text-foreground">{item.split}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.note}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Not Sure CTA */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border"
          >
            <h3 className="text-xl font-bold text-foreground mb-2">Not sure which to choose?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Tell us about your event and we will recommend the perfect package for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild variant="default" size="default">
                <Link to="/get-started">Get a Recommendation</Link>
              </Button>
              <Button asChild variant="outline" size="default">
                <a href="https://wa.me/233245817973" target="_blank" rel="noopener noreferrer">
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

