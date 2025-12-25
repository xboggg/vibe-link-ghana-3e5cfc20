import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { CTASection } from "@/components/sections/CTASection";
import SEO from "@/components/SEO";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Wallet, Sparkles, Rocket, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: FileText,
    title: "Tell Us About Your Event",
    description: "Fill out our simple form with your event details. It takes just 2 minutes.",
    details: "We'll ask about your event type, date, venue, and the features you need. You can also share your vision and any specific requests.",
    duration: "2 minutes",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Receive Your Quote",
    description: "We'll WhatsApp you within 2 hours with a custom quote.",
    details: "Our team reviews your requirements and sends you a detailed quote with package recommendations. Pay 50% deposit via MoMo to confirm your order.",
    duration: "Within 2 hours",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "We Create Your Invitation",
    description: "Our team designs your beautiful digital invitation.",
    details: "Our designers get to work creating your custom invitation. We'll share a preview link for your review. Rush delivery available for 48 hours.",
    duration: "3-5 days",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Review, Approve & Share",
    description: "Preview your invitation, request changes, then share with the world!",
    details: "Review your invitation, request any changes (included in your package), then pay the remaining balance. Receive your unique link and share instantly on WhatsApp.",
    duration: "Same day",
  },
];

const deliverables = [
  "Custom-designed digital invitation",
  "Unique shareable link",
  "RSVP tracking dashboard",
  "Hosting for your package duration",
  "Free updates before event",
  "WhatsApp support",
];

const faqs = [
  {
    question: "How long does it take to create my invitation?",
    answer: "Standard delivery is 3-5 business days. Need it faster? Our rush delivery option gets your invitation ready in just 48 hours for an additional fee.",
  },
  {
    question: "Can I make changes after delivery?",
    answer: "Absolutely! Each package includes revision rounds. Even after approval, you can update event details like venue, time, or contact information at any time.",
  },
  {
    question: "How do guests RSVP?",
    answer: "Guests simply click the RSVP button on your invitation and fill out a simple form. You can track all responses in your dashboard in real-time.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 50% refund if you cancel before design work begins. Once we start creating your invitation, the deposit is non-refundable, but we'll work with you to get it right.",
  },
  {
    question: "How does MoMo collection work?",
    answer: "For packages with MoMo collection, guests can contribute directly through your invitation. Funds go to your MoMo number, and you can track all contributions in your dashboard. We charge a small 2.5% processing fee.",
  },
  {
    question: "What if I need it urgently?",
    answer: "We offer 48-hour rush delivery for an additional GHS 300. Contact us on WhatsApp and we'll prioritize your order.",
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      <SEO 
        title="How It Works"
        description="Simple 4-step process to get your digital invitation. Tell us about your event, receive a quote, we create your design, then share with guests!"
        keywords="digital invitation process, how to order invitation Ghana, event invitation steps"
        canonical="/how-it-works"
      />
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
              Simple Process
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              How It Works
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              From inquiry to celebration in 4 simple steps. We make creating
              your digital invitation effortless.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Timeline */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-16 w-0.5 h-full bg-gradient-to-b from-primary to-secondary" />
                )}

                {/* Icon */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold">
                    {step.number.slice(1)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {step.title}
                    </h3>
                    <span className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                      {step.duration}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">{step.description}</p>
                  <p className="text-foreground/70 text-sm">{step.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What You Get
            </h2>
            <p className="text-muted-foreground text-lg">
              Every VibeLink package includes these essentials.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliverables.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
              >
                <Check className="h-5 w-5 text-accent flex-shrink-0" />
                <span className="text-foreground font-medium">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Got questions? We've got answers.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-border bg-card px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <CTASection />
    </Layout>
  );
};

export default HowItWorks;
