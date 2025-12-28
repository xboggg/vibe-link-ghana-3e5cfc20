import { motion, useInView } from "framer-motion";
import { Link, Share2, RefreshCw, Users, Wallet, Smartphone } from "lucide-react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useRef } from "react";

const features = [
  {
    icon: Link,
    title: "One Beautiful Link",
    description: "Share everything about your event in a single, elegant URL that works everywhere.",
  },
  {
    icon: Share2,
    title: "WhatsApp Ready",
    description: "Optimized for how Ghanaians share. Perfect previews on WhatsApp, Facebook & more.",
  },
  {
    icon: RefreshCw,
    title: "Real-Time Updates",
    description: "Change venue, time, or details anytime. Your guests always see the latest info.",
  },
  {
    icon: Users,
    title: "RSVP Tracking",
    description: "Know exactly who's coming with our easy guest management dashboard.",
  },
  {
    icon: Wallet,
    title: "MoMo Collection",
    description: "Accept contributions digitally. Track donations with our integrated payment system.",
  },
  {
    icon: Smartphone,
    title: "Mobile Perfect",
    description: "Looks stunning on any phone. Because that's how your guests will view it.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeOut" as const,
    },
  },
};

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isGridInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
      <ParallaxBackground variant="geometric" />
      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div 
          ref={headerRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <AnimatedHeading
            as="span"
            variant="fade-up"
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
          >
            Why Choose Us
          </AnimatedHeading>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <AnimatedText text="Why Choose" className="justify-center" />
            {" "}
            <AnimatedHeading
              as="span"
              variant="blur"
              delay={0.4}
              className="text-primary inline-block"
            >
              VibeLink
            </AnimatedHeading>
            <AnimatedHeading as="span" variant="fade-up" delay={0.5} className="inline-block">?</AnimatedHeading>
          </h2>
          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.3}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            We've reimagined event invitations for the digital age, with features
            designed specifically for Ghanaian celebrations.
          </AnimatedHeading>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative p-6 lg:p-8 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
