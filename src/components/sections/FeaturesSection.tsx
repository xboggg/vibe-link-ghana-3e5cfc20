import { motion } from "framer-motion";
import { Link, Share2, RefreshCw, Users, Wallet, Smartphone } from "lucide-react";

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
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose <span className="text-primary">VibeLink</span>?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We've reimagined event invitations for the digital age, with features
            designed specifically for Ghanaian celebrations.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
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
