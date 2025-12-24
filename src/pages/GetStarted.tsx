import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GetStarted = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-b from-navy to-navy-light">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Get Started
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Let's Create Your Invitation
            </h1>
            <p className="text-primary-foreground/80 text-lg lg:text-xl">
              Fill out the form below and we'll get back to you within 2 hours
              with a custom quote.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Form Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="rounded-2xl bg-card border border-border overflow-hidden">
                <iframe
                  src="https://tally.so/embed/vibelink-order?alignLeft=1&hideTitle=1&transparentBackground=1"
                  width="100%"
                  height="800"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="VibeLink Order Form"
                  className="w-full"
                  style={{ minHeight: "800px" }}
                />
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="sticky top-24 space-y-6">
                {/* What Happens Next */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    What Happens Next
                  </h3>
                  <ol className="space-y-3">
                    {[
                      "Submit this form",
                      "We WhatsApp you within 2 hours",
                      "Receive your custom quote",
                      "Pay 50% deposit to start",
                      "Get your invitation in 3-5 days",
                    ].map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-foreground text-sm pt-0.5">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Prefer to Chat */}
                <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Prefer to Chat?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    WhatsApp us directly for a faster response.
                  </p>
                  <Button asChild variant="gold" className="w-full">
                    <a
                      href="https://wa.me/233XXXXXXXXX"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Contact Info
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-foreground">+233 XX XXX XXXX</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-foreground">hello@vibelinkgh.com</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-foreground">Accra, Ghana</span>
                    </li>
                  </ul>
                </div>

                {/* Business Hours */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-secondary" />
                    Business Hours
                  </h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Mon - Sat</span>
                      <span className="text-foreground font-medium">8am - 8pm</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="text-foreground font-medium">10am - 4pm</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default GetStarted;
