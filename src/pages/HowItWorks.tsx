import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { CTASection } from "@/components/sections/CTASection";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  CreditCard,
  Palette,
  CheckCircle,
  Share2,
  Check,
  Sparkles,
  Clock,
  ArrowRight,
  Phone,
  Zap,
  Shield,
  Heart,
  Star,
} from "lucide-react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Fill Our Simple Form",
    description: "Tell us about your event in just 2 minutes.",
    details: "Choose your event type, select a package, pick your add-ons, and share your vision. Our form guides you through everything we need to create your perfect invitation.",
    duration: "2 minutes",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Get Your Custom Quote",
    description: "We'll WhatsApp you within 2 hours.",
    details: "Our team reviews your requirements and sends you a detailed confirmation with your package summary. We'll answer any questions and discuss your vision.",
    duration: "Within 2 hours",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay & Confirm Your Order",
    description: "Secure your spot with 50% deposit.",
    details: "Pay via MoMo or Card to confirm your order. Choose full payment for priority processing and a FREE 'Save the Date' teaser delivered in 24 hours!",
    duration: "Same day",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    number: "04",
    icon: Palette,
    title: "We Design Your Invitation",
    description: "Our team crafts your beautiful invitation.",
    details: "Our talented designers bring your vision to life with stunning visuals, smooth animations, and all your selected features. Need it faster? Rush delivery available in 48 hours!",
    duration: "5-7 days",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500",
    lightBg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    number: "05",
    icon: CheckCircle,
    title: "Review & Perfect",
    description: "Preview and request any changes.",
    details: "We share a preview link for you to review. Request changes and we'll perfect every detail. Revision rounds are included in your package—we don't stop until you love it!",
    duration: "1-2 days",
    color: "from-cyan-500 to-blue-500",
    bgColor: "bg-cyan-500",
    lightBg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  {
    number: "06",
    icon: Share2,
    title: "Go Live & Celebrate!",
    description: "Share your invitation with the world.",
    details: "Pay the remaining balance (if split payment), receive your unique link, and share instantly on WhatsApp! Watch RSVPs roll in and manage everything from your dashboard.",
    duration: "Same day",
    color: "from-fuchsia-500 to-purple-500",
    bgColor: "bg-fuchsia-500",
    lightBg: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
  },
];

const deliverables = [
  { icon: Palette, text: "Custom-designed digital invitation" },
  { icon: Share2, text: "Unique shareable link" },
  { icon: CheckCircle, text: "RSVP tracking dashboard" },
  { icon: Clock, text: "Hosting for your package duration" },
  { icon: Zap, text: "Free updates before your event" },
  { icon: Phone, text: "WhatsApp support" },
];

const benefits = [
  { icon: Zap, title: "Fast Delivery", description: "Standard 5-7 days, Rush 48 hours" },
  { icon: Shield, title: "Secure Payments", description: "MoMo & Card accepted" },
  { icon: Heart, title: "Satisfaction Guaranteed", description: "Revisions until you love it" },
  { icon: Star, title: "Premium Quality", description: "Stunning designs that impress" },
];

const faqs = [
  {
    question: "How long does it take to create my invitation?",
    answer: "Standard delivery is 5-7 business days. Need it faster? Our rush delivery option gets your invitation ready in just 48 hours for an additional GHS 300.",
  },
  {
    question: "Can I make changes after I receive my draft?",
    answer: "Absolutely! Each package includes revision rounds (1-5 depending on package, unlimited for Royal). Even after approval, you can update event details like venue, time, or contact information at any time before your event.",
  },
  {
    question: "How do guests RSVP?",
    answer: "Guests simply click the RSVP button on your invitation and fill out a simple form. You can track all responses in your dashboard in real-time—see who's coming, meal preferences, and more!",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept Mobile Money (MTN, Vodafone, AirtelTigo), bank transfers, and international card payments for our diaspora clients. You can pay 50% deposit to start or full payment for priority processing.",
  },
  {
    question: "How does MoMo collection work for contributions?",
    answer: "For packages with MoMo collection, guests can contribute directly through your invitation. Funds go to your MoMo number, and you can track all contributions in your dashboard. We charge a small 2.5% processing fee.",
  },
  {
    question: "What if I need my invitation urgently?",
    answer: "We offer 48-hour rush delivery for an additional GHS 300. Contact us on WhatsApp and we'll prioritize your order. Rush delivery is subject to availability.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 50% refund if you cancel before design work begins. Once we start creating your invitation, the deposit is non-refundable, but we'll work with you to get it right.",
  },
  {
    question: "Can I see examples of your work?",
    answer: "Yes! Visit our Portfolio page to see live examples of invitations we've created for weddings, funerals, naming ceremonies, graduations, and more. You can even interact with them!",
  },
];

// Floating particles
const FloatingElements = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 30 - 15, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        >
          <Sparkles className="w-4 h-4 text-primary/30" />
        </motion.div>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <Layout>
      <SEO
        title="How It Works"
        description="Simple 6-step process to get your digital invitation. Fill our form, get a quote, pay to confirm, we design, you review, then share with guests!"
        keywords="digital invitation process, how to order invitation Ghana, event invitation steps"
        canonical="/how-it-works"
      />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-24 lg:pt-32 pb-20 bg-gradient-to-br from-[#6B46C1] via-[#553C9A] to-[#44337A] overflow-hidden"
      >
        <FloatingElements />

        {/* Animated background shapes */}
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-4 lg:px-8 relative"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-white/90 text-sm font-medium">Simple 6-Step Process</span>
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6"
            >
              From{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-secondary via-yellow-300 to-secondary bg-clip-text text-transparent">
                  Inquiry
                </span>
                <motion.span
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-secondary to-yellow-300 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                />
              </span>{" "}
              to{" "}
              <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Celebration
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white/80 text-lg lg:text-xl mb-10 max-w-2xl mx-auto"
            >
              We make creating your stunning digital invitation effortless.
              Here's exactly how we bring your vision to life.
            </motion.p>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap justify-center gap-6 md:gap-10"
            >
              {[
                { value: "2 min", label: "To fill form" },
                { value: "2 hrs", label: "Quote response" },
                { value: "5-7 days", label: "Standard delivery" },
                { value: "48 hrs", label: "Rush available" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-secondary">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Steps Timeline Section */}
      <section className="py-20 lg:py-28 bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Your Journey to the{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Perfect Invitation
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Follow these 6 simple steps and watch your event invitation come to life.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative flex items-center gap-8 mb-12 last:mb-0 ${
                    isEven ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Timeline connector */}
                  <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1">
                    {index < steps.length - 1 && (
                      <motion.div
                        className={`w-full h-full bg-gradient-to-b ${step.color}`}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ originY: 0 }}
                      />
                    )}
                  </div>

                  {/* Content Card */}
                  <motion.div
                    className={`flex-1 ${isEven ? "lg:pr-16" : "lg:pl-16"}`}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`relative p-6 lg:p-8 rounded-3xl ${step.lightBg} border border-border/50 overflow-hidden group hover:shadow-xl transition-shadow duration-500`}
                    >
                      {/* Gradient accent */}
                      <motion.div
                        className={`absolute top-0 ${isEven ? "right-0" : "left-0"} w-2 h-full bg-gradient-to-b ${step.color}`}
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ originY: 0 }}
                      />

                      <div className="flex items-start gap-5">
                        {/* Icon */}
                        <motion.div
                          className={`relative flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}
                          animate={{
                            y: [0, -5, 0],
                            rotate: [0, 2, -2, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: index * 0.2,
                          }}
                        >
                          <StepIcon className="h-8 w-8 text-white" />
                          {/* Pulse effect */}
                          <motion.div
                            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color}`}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          />
                        </motion.div>

                        {/* Text content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-sm font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                              STEP {step.number}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </span>
                          </div>
                          <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mb-3">{step.description}</p>
                          <p className="text-foreground/70 text-sm leading-relaxed">{step.details}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Center number circle */}
                  <motion.div
                    className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary items-center justify-center shadow-xl z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: index * 0.1 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-white font-bold text-lg">{step.number.slice(1)}</span>
                  </motion.div>

                  {/* Spacer for alignment */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>

          {/* CTA after steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 px-10 py-6 text-lg">
              <Link to="/get-started">
                Start Your Invitation Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* What You Get Section */}
      <section className="py-20 lg:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        <div className="container mx-auto px-4 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Every Package Includes
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What You{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Get
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every VibeLink invitation comes with these essentials included.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deliverables.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group"
                >
                  <motion.div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:from-primary group-hover:to-secondary transition-all duration-300"
                    whileHover={{ rotate: 10 }}
                  >
                    <ItemIcon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </motion.div>
                  <span className="text-foreground font-medium">{item.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, index) => {
              const BenefitIcon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="text-center p-6 rounded-2xl bg-card/50 border border-border/30"
                >
                  <motion.div
                    className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4"
                    animate={{
                      y: [0, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.2,
                    }}
                  >
                    <BenefitIcon className="h-7 w-7 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-foreground mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-background relative">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4"
            >
              Got Questions?
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to know about our process and services.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="rounded-2xl border border-border bg-card px-6 overflow-hidden data-[state=open]:shadow-lg transition-shadow"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default HowItWorks;
