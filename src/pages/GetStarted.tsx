import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrderFormWizard } from "@/components/order-form/OrderFormWizard";
import { OrderFormData } from "@/data/orderFormData";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { Gift } from "lucide-react";

const GetStarted = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const handleFormComplete = (data: OrderFormData) => {
    toast.success("Order submitted successfully! We'll contact you within 2 hours.");
    navigate("/thank-you");
  };

  const handleFormError = () => {
    toast.error("Failed to submit order. Please try again.");
  };

  return (
    <Layout>
      <SEO 
        title="Get Started"
        description="Create your digital invitation today. Fill out our simple order form and get your stunning event invitation within 24-48 hours."
        keywords="order digital invitation Ghana, create wedding invitation, event invitation order"
        canonical="/get-started"
      />
      {/* Hero */}
      <section className="pt-24 lg:pt-32 pb-12 bg-gradient-to-b from-[#6B46C1] via-[#553C9A] to-[#44337A]">
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
              Fill out the form below with your event details and style preferences.
              We'll get back to you within 2 hours with a custom quote.
            </p>
            {referralCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <Gift className="h-4 w-4 text-secondary" />
                <span className="text-secondary text-sm font-medium">
                  Referral code applied: <strong>{referralCode}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <OrderFormWizard onComplete={handleFormComplete} initialReferralCode={referralCode} />
        </div>
      </section>
    </Layout>
  );
};

export default GetStarted;
