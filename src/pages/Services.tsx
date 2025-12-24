import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CTASection } from "@/components/sections/CTASection";
import {
  Heart,
  Users,
  Baby,
  Cake,
  GraduationCap,
  Church,
  Building,
  Check,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: Heart,
    title: "Wedding Invitations",
    description:
      "Beautiful digital invitations for your traditional and white wedding ceremonies. Share your love story with the world.",
    features: ["Photo galleries", "Love story timeline", "RSVP & meal preferences"],
    slug: "wedding",
  },
  {
    icon: Users,
    title: "Funeral Programs",
    description:
      "Dignified digital tributes honoring your loved ones. Keep family connected during difficult times.",
    features: ["Memorial pages", "Tribute submissions", "MoMo contributions"],
    slug: "funeral",
  },
  {
    icon: Baby,
    title: "Naming Ceremonies",
    description:
      "Celebrate your little one's arrival with a beautiful digital invitation for the outdooring.",
    features: ["Baby photo gallery", "Gift registry links", "Family tree display"],
    slug: "naming",
  },
  {
    icon: Cake,
    title: "Anniversary & Vow Renewal",
    description:
      "Mark your milestone with an elegant digital invitation that celebrates your journey together.",
    features: ["Memory timeline", "Photo journey", "Anniversary wishes"],
    slug: "anniversary",
  },
  {
    icon: GraduationCap,
    title: "Graduation Celebrations",
    description:
      "Share your academic achievement with friends and family through a stunning digital invite.",
    features: ["Achievement showcase", "School photos", "Celebration details"],
    slug: "graduation",
  },
  {
    icon: Building,
    title: "Church & Corporate Events",
    description:
      "Professional digital invitations for church programs, conferences, and corporate events.",
    features: ["Event schedule", "Speaker profiles", "Registration forms"],
    slug: "corporate",
  },
];

const allFeatures = [
  "Countdown timer",
  "Photo gallery",
  "Music player",
  "RSVP form",
  "Google Maps",
  "Calendar integration",
  "MoMo collection",
  "Analytics dashboard",
  "Custom domain",
  "WhatsApp sharing",
  "Multiple languages",
  "Contact cards",
];

const addOns = [
  { name: "Rush delivery (48hrs)", price: "GHS 300" },
  { name: "Custom domain", price: "GHS 200/year" },
  { name: "Video background", price: "GHS 200" },
  { name: "Extra photos (+10)", price: "GHS 100" },
  { name: "Bilingual (English + Twi)", price: "GHS 250" },
  { name: "QR code cards (50)", price: "GHS 150" },
];

const Services = () => {
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
              Our Services
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Premium Digital Invitations
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              Premium digital invitations for every Ghanaian ceremony. Beautiful,
              shareable, and unforgettable.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <service.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h3>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to={`/portfolio?type=${service.slug}`}>
                      See Examples
                    </Link>
                  </Button>
                  <Button asChild variant="gold" size="sm" className="flex-1">
                    <Link to="/get-started">Get Quote</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features */}
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
              Features Across All Packages
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every VibeLink invitation comes packed with features to make your
              event unforgettable.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <Check className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-foreground text-sm font-medium">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enhance Your Invitation
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Add extra features to make your digital invitation even more special.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addOns.map((addon, index) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border"
                >
                  <span className="text-foreground font-medium">{addon.name}</span>
                  <span className="text-secondary font-bold">{addon.price}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default Services;
