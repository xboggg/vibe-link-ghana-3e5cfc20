import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, MessageCircle, Copy, Search } from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";

const ThankYou = () => {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderEmail, setOrderEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get stored data from session storage
    const storedUrl = sessionStorage.getItem("vibelink_whatsapp_url");
    const storedOrderId = sessionStorage.getItem("vibelink_order_id");
    const storedEmail = sessionStorage.getItem("vibelink_order_email");
    
    if (storedUrl) setWhatsappUrl(storedUrl);
    if (storedOrderId) setOrderId(storedOrderId);
    if (storedEmail) setOrderEmail(storedEmail);
  }, []);

  const handleWhatsAppClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } else {
      window.open("https://wa.me/233245817973", "_blank", "noopener,noreferrer");
    }
  };

  const copyOrderId = () => {
    if (orderId) {
      const shortId = orderId.substring(0, 8).toUpperCase();
      navigator.clipboard.writeText(shortId);
      toast.success("Order ID copied to clipboard!");
    }
  };

  const shortOrderId = orderId ? orderId.substring(0, 8).toUpperCase() : null;

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

            <p className="text-primary-foreground/80 text-lg lg:text-xl mb-6">
              Your request has been received. We're excited to help you create
              something beautiful!
            </p>

            {/* Order ID Display */}
            {shortOrderId && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 mb-6 inline-block"
              >
                <p className="text-primary-foreground/70 text-sm mb-1">Your Order ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl md:text-3xl font-mono font-bold text-accent">
                    #{shortOrderId}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyOrderId}
                    className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  >
                    <Copy className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-primary-foreground/60 text-xs mt-2">
                  Save this ID to track your order status
                </p>
              </motion.div>
            )}

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
              <Button onClick={handleWhatsAppClick} variant="hero" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                {whatsappUrl ? "Send Order via WhatsApp" : "Chat on WhatsApp"}
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/track-order">
                  <Search className="mr-2 h-5 w-5" />
                  Track Your Order
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-center mt-4">
              <Button asChild variant="link" className="text-primary-foreground/60">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {whatsappUrl && (
              <p className="text-primary-foreground/60 text-sm mt-4">
                Click the button above to send your order details to our team via WhatsApp
              </p>
            )}

            {/* Confirmation Email Notice */}
            {orderEmail && (
              <p className="text-primary-foreground/50 text-xs mt-6">
                A confirmation email has been sent to <span className="font-medium">{orderEmail}</span>
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ThankYou;
