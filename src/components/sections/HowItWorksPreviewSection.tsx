import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { AnimatedHeading, AnimatedText } from "@/components/AnimatedHeading";
import { useRef } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.15,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: "easeOut" as const,
    },
  },
};

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Tell Us About Your Event",
    description: "Fill our simple form with your event details. It takes just 2 minutes.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "We Create Your Invitation",
    description: "We create your beautiful invitation in 5-10 days. Express available!",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Share & Celebrate",
    description: "One link does it all. Share on WhatsApp and watch the RSVPs roll in.",
  },
];

export function HowItWorksPreviewSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const isHeaderInView = useInView(headerRef, { once: true, amount: 0.3 });
  const isStepsInView = useInView(stepsRef, { once: true, amount: 0.2 });

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
            Simple Process
          </AnimatedHeading>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            <AnimatedText text="Simple as" className="justify-center" />
            {" "}
            <AnimatedHeading
              as="span"
              variant="blur"
              delay={0.3}
              className="text-primary inline-block"
            >
              1-2-3
            </AnimatedHeading>
          </h2>
          <AnimatedHeading
            as="p"
            variant="fade-up"
            delay={0.4}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            From inquiry to celebration, we make creating your digital invitation
            effortless.
          </AnimatedHeading>
        </motion.div>

        {/* Steps */}
        <motion.div 
          ref={stepsRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate={isStepsInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={stepVariants}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[55%] w-[90%] h-[2px] bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 rounded-full" />
              )}

              {/* Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                {/* Pulsating ring effect */}
                <motion.div
                  className="absolute inset-0 w-24 h-24 rounded-full bg-primary/20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.3,
                  }}
                />
                <motion.div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-primary/20"
                  animate={{
                    y: [0, -8, 0],
                    boxShadow: [
                      "0 4px 20px rgba(138, 43, 226, 0.15)",
                      "0 12px 30px rgba(138, 43, 226, 0.3)",
                      "0 4px 20px rgba(138, 43, 226, 0.15)",
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.4,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <motion.div
                    animate={{
                      rotate: [0, -5, 5, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  >
                    <step.icon className="h-10 w-10 text-primary" />
                  </motion.div>
                </motion.div>
                <motion.span
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold shadow-lg"
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                >
                  {step.number.slice(1)}
                </motion.span>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button asChild variant="outline" size="lg">
            <Link to="/how-it-works">
              See Full Process
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
