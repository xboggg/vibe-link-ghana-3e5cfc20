import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, MessageCircle, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const ThankYou = () => {
  return (
    <Layout>
      <SEO 
        title="Thank You"
        description="Your order has been received. We'll contact you within 2 hours with your custom quote."
        noindex={true}
      />
      <section className="pt-24 lg:pt-32 pb-20 min-h-[80vh] flex items-center bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-8">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Thank You! 🎉
            </h1>

            <p className="text-primary-foreground/80 text-lg lg:text-xl mb-8">
              Your request has been received. We're excited to help you create
              something beautiful!
            </p>

            {/* What Happens Next */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-lg font-bold text-primary-foreground mb-4">
                What Happens Next
              </h3>
              <ul className="space-y-3">
                {[
                  "Our team reviews your request",
                  "We WhatsApp you within 2 hours with your quote",
                  "You approve and pay 50% deposit",
                  "We start creating your invitation",
                  "You receive your beautiful invite in 3-5 days",
                ].map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-primary-foreground/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild variant="hero" size="lg">
                <a
                  href="https://wa.me/233XXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Chat on WhatsApp
                </a>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/">
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ThankYou;
