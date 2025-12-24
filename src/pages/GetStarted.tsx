import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { OrderFormWizard } from "@/components/order-form/OrderFormWizard";
import { OrderFormData } from "@/data/orderFormData";
import { toast } from "sonner";

const GetStarted = () => {
  const navigate = useNavigate();

  const handleFormComplete = (data: OrderFormData) => {
    console.log("Order submitted:", data);
    toast.success("Order submitted successfully! We'll contact you within 2 hours.");
    navigate("/thank-you");
  };

  return (
    <Layout>
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
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <OrderFormWizard onComplete={handleFormComplete} />
        </div>
      </section>
    </Layout>
  );
};

export default GetStarted;
