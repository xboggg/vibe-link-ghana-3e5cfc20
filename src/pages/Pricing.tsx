import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import { Check, X, Star, MessageCircle, Sparkles, Crown, Percent } from "lucide-react";
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
    excluded: ["Photo gallery", "RSVP tracking", "Background music", "Calendar sync"],
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
      { name: "Photo gallery (5 photos)", included: true },
      { name: "RSVP tracking", included: true },
      { name: "Background music", included: true },
      { name: "White-label", included: true },
      { name: "90-day hosting", included: true },
      { name: "2 revision rounds", included: true },
    ],
    excluded: ["Video integration", "Calendar sync", "MoMo donation link", "Priority WhatsApp support"],
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
      { name: "Photo gallery (10 photos)", included: true },
      { name: "Video integration", included: true },
      { name: "Calendar sync", included: true },
      { name: "MoMo donation link", included: true },
      { name: "Priority WhatsApp support", included: true },
      { name: "6-month hosting", included: true },
      { name: "5 revisions", included: true },
    ],
    excluded: ["MoMo tracking dashboard", "Guest messaging wall", "Custom domain", "Host dashboard"],
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
      { name: "Advanced animations", included: true },
      { name: "MoMo tracking dashboard", included: true },
      { name: "Program booklet page", included: true },
      { name: "Host dashboard", included: true },
      { name: "Custom domain", included: true },
      { name: "Book a ride", included: true },
      { name: "Lost & found", included: true },
      { name: "White-label (no branding)", included: true },
      { name: "1-year hosting", included: true },
      { name: "Unlimited revisions", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Professional consultation", included: true },
    ],
    excluded: [],
  },
];

const addOns = [
  { name: "Video Integration", price: "GHS 200", desc: "Embed videos on your invite" },
  { name: "Calendar Sync", price: "GHS 100", desc: "Guests save the date to their calendar" },
  { name: "MoMo Tracking Dashboard", price: "GHS 200", desc: "Track donations in real-time" },
  { name: "Program Booklet Page", price: "GHS 150", desc: "Digital event program for guests" },
  { name: "Host Dashboard", price: "GHS 200", desc: "Manage RSVPs & view analytics" },
  { name: "RSVP Tracking", price: "GHS 100", desc: "Track guest responses & attendance" },
  { name: "QR Check-in System", price: "GHS 150", desc: "Scan guests on arrival" },
  { name: "Digital Guestbook", price: "GHS 150", desc: "Guests leave messages & photos" },
  { name: "Gift Acknowledgment Page", price: "GHS 150", desc: "Publicly thank gift contributors" },
  { name: "Live Stream Embed", price: "GHS 200", desc: "Stream your event live to guests" },
  { name: "Extended Hosting (6 months)", price: "GHS 250", desc: "Keep your invite live longer" },
  { name: "Extended Hosting (1 year)", price: "GHS 500", desc: "Full year of hosting" },
  { name: "Custom Domain", price: "GHS 200/yr", desc: "Use your own domain name" },
  { name: "Extra Photos (+10)", price: "GHS 100", desc: "Expand your photo gallery" },
  { name: "Additional Language", price: "GHS 150", desc: "Add Twi, French, or others" },
  { name: "Background Music", price: "GHS 50", desc: "Add music to your invitation" },
  { name: "Memorial Page Renewal", price: "GHS 100/yr", desc: "Keep tribute pages live yearly" },
  { name: "Obituary Section", price: "Free", desc: "Add obituary for funeral invites (on request)" },
  { name: "Lost & Found", price: "GHS 100", desc: "Help guests find lost items" },
  { name: "Nearby Accommodation", price: "GHS 100", desc: "Show hotels near your venue" },
  { name: "Book a Ride", price: "GHS 100", desc: "Let guests request transport" },
];

// Full comparison table with all features
const comparisonFeatures = [
  { feature: "Hero Banners", starter: "1", classic: "2", prestige: "3", royal: "5" },
  { feature: "Photo Gallery", starter: false, classic: "5 photos", prestige: "10 photos", royal: "Unlimited" },
  { feature: "Custom Colors", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Background Music", starter: false, classic: true, prestige: true, royal: true },
  { feature: "RSVP Tracking", starter: false, classic: true, prestige: true, royal: true },
  { feature: "Countdown Timer", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Google Maps", starter: true, classic: true, prestige: true, royal: true },
  { feature: "WhatsApp Share", starter: true, classic: true, prestige: true, royal: true },
  { feature: "Calendar Sync", starter: false, classic: false, prestige: true, royal: true },
  { feature: "Video Integration", starter: false, classic: false, prestige: true, royal: true },
  { feature: "MoMo Donation Link", starter: false, classic: false, prestige: "Display", royal: "Tracking" },
  { feature: "Guest Messaging Wall", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Custom Domain", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Program Booklet", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Host Dashboard", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Book a Ride", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Lost & Found", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Multi-Event Pages", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Advanced Animations", starter: false, classic: false, prestige: false, royal: true },
  { feature: "White-label", starter: false, classic: true, prestige: true, royal: "No branding" },
  { feature: "Hosting Duration", starter: "30 days", classic: "90 days", prestige: "6 months", royal: "1 year" },
  { feature: "Revisions", starter: "1", classic: "2", prestige: "5", royal: "Unlimited" },
  { feature: "Account Manager", starter: false, classic: false, prestige: false, royal: true },
  { feature: "Delivery Time", starter: "5-7 days", classic: "5-7 days", prestige: "5-7 days", royal: "7-10 days" },
];

const Pricing = () => {
  const renderCellValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center ring-2 ring-accent/30">
            <Check className="h-4 w-4 text-accent" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center">
            <X className="h-3.5 w-3.5 text-muted-foreground/50" />
          </div>
        </div>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs">
        {value}
      </span>
    );
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
                  <Link to={pkg.name === "Royal Vibe" ? "/contact" : "/get-started"}>
                    {pkg.name === "Royal Vibe" ? "Contact Us" : "Get Started"}
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Feature Comparison
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">Compare Packages</h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Find your perfect fit at a glance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            {/* Desktop Table */}
            <div className="hidden md:block overflow-visible rounded-3xl border border-border/40 shadow-2xl bg-card/80 backdrop-blur-sm">
              {/* Table Header */}
              <div className="grid grid-cols-5 bg-gradient-to-r from-primary via-purple-dark to-navy rounded-t-3xl">
                <div className="p-5 flex items-center">
                  <span className="text-white font-bold text-sm tracking-wide uppercase">Feature</span>
                </div>
                <div className="p-4 text-center border-l border-white/10 hover:bg-white/5 transition-colors">
                  <div className="text-white/90 font-semibold text-sm mb-1">Starter</div>
                  <div className="text-secondary font-bold text-lg">GHS 500</div>
                </div>
                <div className="p-4 pt-6 text-center border-l border-white/10 bg-white/15 relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold shadow-xl ring-2 ring-secondary/30">
                      <Star className="h-3 w-3 fill-current" />
                      POPULAR
                    </span>
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">Classic</div>
                  <div className="text-secondary font-bold text-lg">GHS 1,200</div>
                </div>
                <div className="p-4 text-center border-l border-white/10 hover:bg-white/5 transition-colors">
                  <div className="text-white/90 font-semibold text-sm mb-1">Prestige</div>
                  <div className="text-secondary font-bold text-lg">GHS 2,500</div>
                </div>
                <div className="p-4 text-center border-l border-white/10 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-center gap-1.5 text-white font-semibold text-sm mb-1">
                    <Crown className="h-4 w-4 text-amber-400" />
                    Royal
                  </div>
                  <div className="text-secondary font-bold text-lg">GHS 5,000+</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border/20">
                {comparisonFeatures.map((row, index) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-5 ${index % 2 === 0 ? "bg-background/50" : "bg-muted/30"} hover:bg-primary/5 transition-all duration-200`}
                  >
                    <div className="py-4 px-5 text-foreground font-medium text-sm flex items-center">
                      {row.feature}
                    </div>
                    <div className="py-4 px-3 flex items-center justify-center border-l border-border/15">
                      {renderCellValue(row.starter)}
                    </div>
                    <div className="py-4 px-3 flex items-center justify-center border-l border-border/15 bg-secondary/8">
                      {renderCellValue(row.classic)}
                    </div>
                    <div className="py-4 px-3 flex items-center justify-center border-l border-border/15">
                      {renderCellValue(row.prestige)}
                    </div>
                    <div className="py-4 px-3 flex items-center justify-center border-l border-border/15">
                      {renderCellValue(row.royal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer - CTA */}
              <div className="grid grid-cols-5 bg-gradient-to-r from-muted/50 to-muted/30 border-t border-border/30 rounded-b-3xl">
                <div className="p-5"></div>
                <div className="p-4 flex justify-center border-l border-border/15">
                  <Button asChild variant="outline" size="sm" className="text-xs h-9 px-5 rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                    <Link to="/get-started">Get Started</Link>
                  </Button>
                </div>
                <div className="p-4 flex justify-center border-l border-border/15 bg-secondary/8">
                  <Button asChild variant="gold" size="sm" className="text-xs h-9 px-5 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <Link to="/get-started">Get Started</Link>
                  </Button>
                </div>
                <div className="p-4 flex justify-center border-l border-border/15">
                  <Button asChild variant="outline" size="sm" className="text-xs h-9 px-5 rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                    <Link to="/get-started">Get Started</Link>
                  </Button>
                </div>
                <div className="p-4 flex justify-center border-l border-border/15">
                  <Button asChild variant="outline" size="sm" className="text-xs h-9 px-5 rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all">
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Mobile Horizontal Scroll Table */}
            <div className="md:hidden">
              <div className="overflow-x-auto pb-4 rounded-2xl border border-border/40 shadow-xl bg-card/80 backdrop-blur-sm" style={{ WebkitOverflowScrolling: 'touch' }}>
                <table className="w-full border-collapse" style={{ minWidth: '680px' }}>
                  {/* Table Header */}
                  <thead>
                    <tr className="bg-gradient-to-r from-primary via-purple-dark to-navy">
                      <th className="p-3 text-left text-white font-bold text-xs w-[140px] uppercase tracking-wide">
                        Feature
                      </th>
                      <th className="p-3 text-center border-l border-white/10 w-[120px]">
                        <div className="text-white/90 font-semibold text-xs">Starter</div>
                        <div className="text-secondary font-bold text-sm mt-0.5">GHS 500</div>
                      </th>
                      <th className="p-3 text-center border-l border-white/10 bg-white/15 w-[120px] relative">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold shadow-lg whitespace-nowrap ring-1 ring-secondary/30">
                            <Star className="h-2.5 w-2.5 fill-current" />
                            POPULAR
                          </span>
                        </div>
                        <div className="text-white font-semibold text-xs mt-3">Classic</div>
                        <div className="text-secondary font-bold text-sm mt-0.5">GHS 1,200</div>
                      </th>
                      <th className="p-3 text-center border-l border-white/10 w-[120px]">
                        <div className="text-white/90 font-semibold text-xs">Prestige</div>
                        <div className="text-secondary font-bold text-sm mt-0.5">GHS 2,500</div>
                      </th>
                      <th className="p-3 text-center border-l border-white/10 w-[120px]">
                        <div className="flex items-center justify-center gap-1 text-white font-semibold text-xs">
                          <Crown className="h-3 w-3 text-amber-400" />
                          Royal
                        </div>
                        <div className="text-secondary font-bold text-sm mt-0.5">GHS 5,000+</div>
                      </th>
                    </tr>
                  </thead>
                  {/* Table Body */}
                  <tbody>
                    {comparisonFeatures.map((row, index) => (
                      <tr key={row.feature} className={index % 2 === 0 ? "bg-background/50" : "bg-muted/30"}>
                        <td className="py-3 px-3 text-foreground font-medium text-xs">
                          {row.feature}
                        </td>
                        <td className="py-3 px-2 text-center border-l border-border/15">
                          {renderCellValue(row.starter)}
                        </td>
                        <td className="py-3 px-2 text-center border-l border-border/15 bg-secondary/8">
                          {renderCellValue(row.classic)}
                        </td>
                        <td className="py-3 px-2 text-center border-l border-border/15">
                          {renderCellValue(row.prestige)}
                        </td>
                        <td className="py-3 px-2 text-center border-l border-border/15">
                          {renderCellValue(row.royal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer */}
                  <tfoot>
                    <tr className="bg-gradient-to-r from-muted/50 to-muted/30 border-t border-border/30">
                      <td className="p-3"></td>
                      <td className="p-3 text-center border-l border-border/15">
                        <Button asChild variant="outline" size="sm" className="text-[10px] h-8 px-3 rounded-full">
                          <Link to="/get-started">Select</Link>
                        </Button>
                      </td>
                      <td className="p-3 text-center border-l border-border/15 bg-secondary/8">
                        <Button asChild variant="gold" size="sm" className="text-[10px] h-8 px-3 rounded-full shadow-md">
                          <Link to="/get-started">Select</Link>
                        </Button>
                      </td>
                      <td className="p-3 text-center border-l border-border/15">
                        <Button asChild variant="outline" size="sm" className="text-[10px] h-8 px-3 rounded-full">
                          <Link to="/get-started">Select</Link>
                        </Button>
                      </td>
                      <td className="p-3 text-center border-l border-border/15">
                        <Button asChild variant="outline" size="sm" className="text-[10px] h-8 px-3 rounded-full">
                          <Link to="/contact">Contact</Link>
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-center text-muted-foreground text-xs mt-3 flex items-center justify-center gap-2">
                <span className="inline-block w-8 h-px bg-border"></span>
                ← Swipe to compare all packages →
                <span className="inline-block w-8 h-px bg-border"></span>
              </p>
            </div>
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
            <p className="text-muted-foreground max-w-xl mx-auto">
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
      <section className="py-14 bg-gradient-to-b from-muted/30 via-background to-muted/20 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
              Pay Your Way
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Flexible Payment Options</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We understand budgets. Choose a payment plan that works best for you.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <div className="relative p-6 rounded-2xl bg-card border-2 border-green-500/30 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-semibold">
                      RECOMMENDED
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-1">Full Payment</h4>
                  <div className="text-4xl font-bold text-green-500 mb-3">100%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Pay once and relax. Your invitation gets priority processing.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Priority queue - we start immediately</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>Free "Save the Date" teaser in 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>No follow-up payments to worry about</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 50/50 Split Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <div className="relative p-6 rounded-2xl bg-card border-2 border-purple-500/30 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Percent className="h-6 w-6 text-purple-500" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold">
                      FLEXIBLE
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-1">Split Payment</h4>
                  <div className="text-4xl font-bold text-purple-500 mb-3">50% + 50%</div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Split your payment in two. Pay half now, half before delivery.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>50% deposit to start your project</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>Review draft before final payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-purple-500" />
                      <span>Balance due before final delivery</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Animated Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span>Secure MoMo & Card Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-blue-500" />
                </div>
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-purple-500" />
                </div>
                <span>Money-Back Guarantee</span>
              </div>
            </motion.div>
          </div>
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

