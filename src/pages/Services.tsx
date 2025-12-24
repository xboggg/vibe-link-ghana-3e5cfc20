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
  Building,
  Check,
  Plus,
} from "lucide-react";

// Import service images
import weddingImg from "@/assets/service-wedding.jpg";
import funeralImg from "@/assets/hero-funeral.jpg";
import namingImg from "@/assets/hero-naming.jpg";
import anniversaryImg from "@/assets/service-anniversary.jpg";
import graduationImg from "@/assets/hero-graduation.jpg";
import corporateImg from "@/assets/hero-corporate.jpg";

const services = [
  {
    icon: Heart,
    title: "Wedding Invitations",
    description:
      "Beautiful digital invitations for your traditional, white wedding, or both.",
    features: [
      "Dual ceremony support",
      "Love story timeline",
      "RSVP with meal preferences",
      "Wedding party introductions",
      "Gift registry integration",
    ],
    slug: "wedding",
    image: weddingImg,
    stats: { created: "500+", satisfaction: "98%", label: "Weddings Created" },
  },
  {
    icon: Users,
    title: "Funeral Programs",
    description:
      "Dignified memorial pages that honor your loved ones with respect.",
    features: [
      "Tribute wall",
      "Donation links",
      "Program timeline",
      "Photo memories",
      "Memorial page forever",
    ],
    slug: "funeral",
    image: funeralImg,
    stats: { created: "200+", satisfaction: "100%", label: "Families Served" },
  },
  {
    icon: Baby,
    title: "Naming Ceremonies",
    description:
      "Celebrate the arrival of new life with joyful digital invitations.",
    features: [
      "Baby introduction",
      "Name meaning display",
      "Godparents section",
      "Photo gallery",
      "Gift suggestions",
    ],
    slug: "naming",
    image: namingImg,
    stats: { created: "300+", satisfaction: "99%", label: "Babies Welcomed" },
  },
  {
    icon: Cake,
    title: "Anniversary & Vow Renewal",
    description:
      "Mark your milestones with elegant digital celebrations.",
    features: [
      "Journey timeline",
      "Photo memories",
      "Love quotes",
      "Guest messaging",
      "Celebration countdown",
    ],
    slug: "anniversary",
    image: anniversaryImg,
    stats: { created: "150+", satisfaction: "97%", label: "Milestones Celebrated" },
  },
  {
    icon: GraduationCap,
    title: "Graduation Celebrations",
    description:
      "Share your academic achievements with family and friends.",
    features: [
      "Achievement showcase",
      "Ceremony details",
      "Party information",
      "Photo gallery",
      "Thank you messages",
    ],
    slug: "graduation",
    image: graduationImg,
    stats: { created: "400+", satisfaction: "99%", label: "Graduates Honored" },
  },
  {
    icon: Building,
    title: "Church & Corporate Events",
    description:
      "Professional digital invitations for church programs, conferences, and corporate events.",
    features: [
      "Event schedule",
      "Speaker profiles",
      "Registration forms",
      "Venue information",
      "Program agenda",
    ],
    slug: "corporate",
    image: corporateImg,
    stats: { created: "250+", satisfaction: "98%", label: "Events Hosted" },
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

const Services = () => {
  return (
    <Layout>
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
              Event Types We Serve
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Event Types We Serve
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              From joyful celebrations to dignified memorials
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services - Alternating Layout */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-16 lg:space-y-24">
            {services.map((service, index) => {
              const isEven = index % 2 === 0;
              const IconComponent = service.icon;
              
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Content */}
                  <div className={`space-y-6 ${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                      {service.title}
                    </h2>
                    
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-accent flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button asChild variant="default" size="default">
                        <Link to={`/portfolio?type=${service.slug}`}>
                          See Examples
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="default">
                        <Link to="/get-started">Get Quote</Link>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image with Hover Stats */}
                  <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="group relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] cursor-pointer"
                    >
                      <img
                        src={service.image}
                        alt={`${service.title} - Ghana`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Default gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
                      
                      {/* Hover overlay with stats */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/70 to-primary/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          className="text-center text-primary-foreground"
                        >
                          <div className="text-5xl md:text-6xl font-bold mb-2">
                            {service.stats.created}
                          </div>
                          <div className="text-lg font-medium mb-4 opacity-90">
                            {service.stats.label}
                          </div>
                          <div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                            <span className="text-sm">Client Satisfaction:</span>
                            <span className="text-lg font-bold">{service.stats.satisfaction}</span>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
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

      <CTASection />
    </Layout>
  );
};

export default Services;