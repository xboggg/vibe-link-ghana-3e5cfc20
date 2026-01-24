import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare, CreditCard, Palette, CheckCircle, Share2, ArrowRight, Sparkles } from "lucide-react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 80, scale: 0.8, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Fill Our Simple Form",
    description: "Tell us about your event in just 2 minutes. Select your package and add-ons.",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
    shadowColor: "rgba(139, 92, 246, 0.4)",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Get Your Quote",
    description: "We'll WhatsApp you within 2 hours with your custom quote and next steps.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    shadowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay & Confirm",
    description: "Pay 50% deposit via MoMo or Card. Full payment gets priority processing!",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
    shadowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    number: "04",
    icon: Palette,
    title: "We Design Magic",
    description: "Our team crafts your beautiful invitation in 5-7 days. Rush delivery in 48hrs!",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
    shadowColor: "rgba(236, 72, 153, 0.4)",
  },
  {
    number: "05",
    icon: CheckCircle,
    title: "Review & Perfect",
    description: "Preview your draft and request any changes. Revisions included in your package.",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500/10",
    shadowColor: "rgba(6, 182, 212, 0.4)",
  },
  {
    number: "06",
    icon: Share2,
    title: "Go Live & Share!",
    description: "Get your unique link and share on WhatsApp. Watch the RSVPs roll in!",
    color: "from-fuchsia-500 to-purple-500",
    bgColor: "bg-fuchsia-500/10",
    shadowColor: "rgba(217, 70, 239, 0.4)",
  },
];

// Floating particles component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export function HowItWorksPreviewSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isStepsInView = useInView(stepsRef, { once: true, amount: 0.1 });

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-background to-muted/30 relative overflow-hidden">
      <ParallaxBackground variant="geometric" />
      <FloatingParticles />

      {/* Decorative gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative">
        {/* Header */}
        <motion.div
          ref={headerRef}
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isHeaderInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-primary text-sm font-semibold">Simple 6-Step Process</span>
            <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
          </motion.div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            <AnimatedText text="From Inquiry to" className="justify-center" />
            <br />
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isHeaderInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
            >
              Celebration
            </motion.span>
          </h2>

          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.5}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto"
          >
            We make creating your stunning digital invitation effortless.
            Here's how we bring your vision to life.
          </AnimatedHeading>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate={isStepsInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className={`relative p-6 lg:p-8 rounded-2xl bg-card border border-border/50 backdrop-blur-sm overflow-hidden transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-2xl`}
                style={{
                  boxShadow: `0 4px 20px ${step.shadowColor.replace('0.4', '0.1')}`
                }}
              >
                {/* Gradient overlay on hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Step number badge */}
                <motion.div
                  className="absolute -top-3 -right-3 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                >
                  <span className="text-primary-foreground font-bold text-lg">{step.number.slice(1)}</span>
                </motion.div>

                {/* Icon container */}
                <motion.div
                  className={`relative w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-5`}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.15,
                  }}
                >
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-0 blur-xl`}
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  />
                  <step.icon className={`h-8 w-8 bg-gradient-to-br ${step.color} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }} />
                  <step.icon className={`h-8 w-8 absolute`} style={{
                    background: `linear-gradient(135deg, ${step.color.includes('violet') ? '#8b5cf6' : step.color.includes('amber') ? '#f59e0b' : step.color.includes('emerald') ? '#10b981' : step.color.includes('pink') ? '#ec4899' : step.color.includes('cyan') ? '#06b6d4' : '#d946ef'}, ${step.color.includes('violet') ? '#9333ea' : step.color.includes('amber') ? '#f97316' : step.color.includes('emerald') ? '#14b8a6' : step.color.includes('pink') ? '#f43f5e' : step.color.includes('cyan') ? '#3b82f6' : '#a855f7'})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                  {step.description}
                </p>

                {/* Animated border */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${step.color} rounded-full`}
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                />
              </div>

              {/* Connector arrow (desktop only) */}
              {index < steps.length - 1 && index !== 2 && (
                <motion.div
                  className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                  animate={{
                    x: [0, 5, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ArrowRight className="w-6 h-6 text-primary" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-8">
              <Link to="/get-started">
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Invitation
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/how-it-works" className="flex items-center gap-2">
                See Full Process
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Takes just 2 minutes to get started • Response within 2 hours
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
