import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, MessageCircle, Copy, Search, CreditCard, Loader2 } from "lucide-react";
import SEO from "@/components/SEO";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderEmail, setOrderEmail] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get stored data from session storage
    const storedUrl = sessionStorage.getItem("vibelink_whatsapp_url");
    const storedOrderId = sessionStorage.getItem("vibelink_order_id");
    const storedEmail = sessionStorage.getItem("vibelink_order_email");
    const storedTotal = sessionStorage.getItem("vibelink_order_total");
    
    if (storedUrl) setWhatsappUrl(storedUrl);
    if (storedOrderId) setOrderId(storedOrderId);
    if (storedEmail) setOrderEmail(storedEmail);
    if (storedTotal) setTotalPrice(parseFloat(storedTotal));

    // Check for payment callback
    const reference = searchParams.get("reference");
    const trxref = searchParams.get("trxref");
    
    if (reference || trxref) {
      verifyPayment(reference || trxref!);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    const storedOrderId = sessionStorage.getItem("vibelink_order_id");
    if (!storedOrderId) {
      toast.error("Order not found. Please contact support.");
      return;
    }

    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: {
          reference,
          orderId: storedOrderId,
          paymentType: "deposit",
        },
      });

      if (error) throw error;

      if (data.success) {
        setDepositPaid(true);
        toast.success("Payment successful! Your deposit has been received.");
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        toast.error(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Failed to verify payment. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!orderId || !orderEmail) {
      toast.error("Order information not found. Please contact support.");
      return;
    }

    const depositAmount = totalPrice * 0.5;
    if (depositAmount <= 0) {
      toast.error("Invalid order amount. Please contact support.");
      return;
    }

    setIsPaymentLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/thank-you`;
      
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: {
          orderId,
          email: orderEmail,
          amount: depositAmount,
          paymentType: "deposit",
          callbackUrl,
        },
      });

      if (error) throw error;

      if (data.success && data.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.authorization_url;
      } else {
        toast.error(data.error || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

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
  const depositAmount = totalPrice * 0.5;

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
            {/* Verifying Payment Overlay */}
            {isVerifying && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-card p-8 rounded-2xl shadow-lg text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-lg font-medium">Verifying your payment...</p>
                </div>
              </div>
            )}

            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-8">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
              {depositPaid ? "Payment Received! 🎉" : "Thank You! 🎉"}
            </h1>

            <p className="text-primary-foreground/80 text-lg lg:text-xl mb-6">
              {depositPaid 
                ? "Your deposit has been confirmed. We're now starting work on your invitation!"
                : "Your request has been received. Pay your 50% deposit to get started!"}
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

            {/* Payment Section */}
            {!depositPaid && totalPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-accent/20 backdrop-blur-sm rounded-2xl p-6 mb-8"
              >
                <h3 className="text-lg font-bold text-primary-foreground mb-2">
                  Pay 50% Deposit to Start
                </h3>
                <p className="text-primary-foreground/70 text-sm mb-4">
                  Secure your order and we'll start working on your invitation immediately
                </p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-3xl font-bold text-accent">
                    GH₵ {depositAmount.toFixed(2)}
                  </span>
                  <span className="text-primary-foreground/60 text-sm">
                    (50% of GH₵ {totalPrice.toFixed(2)})
                  </span>
                </div>
                <Button
                  onClick={handlePayDeposit}
                  disabled={isPaymentLoading}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3"
                  size="lg"
                >
                  {isPaymentLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Deposit Now
                    </>
                  )}
                </Button>
                <p className="text-primary-foreground/50 text-xs mt-3">
                  Secure payment powered by Paystack
                </p>
              </motion.div>
            )}

            {/* Deposit Paid Confirmation */}
            {depositPaid && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="text-lg font-bold text-primary-foreground">
                    Deposit Paid Successfully!
                  </h3>
                </div>
                <p className="text-primary-foreground/70 text-sm">
                  Your 50% deposit of GH₵ {depositAmount.toFixed(2)} has been received.
                  <br />
                  Balance of GH₵ {depositAmount.toFixed(2)} due upon delivery.
                </p>
              </motion.div>
            )}

            {/* What Happens Next */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 mb-8 text-left">
              <h3 className="text-lg font-bold text-primary-foreground mb-4">
                What Happens Next
              </h3>
              <ul className="space-y-3">
                {(depositPaid ? [
                  "✓ Our team has received your deposit",
                  "We're now designing your invitation",
                  "You'll receive a preview within 24-48 hours",
                  "Pay remaining 50% after you approve the design",
                  "Receive your final invitation files",
                ] : [
                  "Pay 50% deposit above to start",
                  "Our team begins designing your invitation",
                  "You receive a preview within 24-48 hours",
                  "Pay remaining 50% after you approve",
                  "Receive your beautiful invite!",
                ]).map((step, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-primary-foreground/80"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      depositPaid && index === 0 
                        ? "bg-green-500 text-white" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {depositPaid && index === 0 ? "✓" : index + 1}
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
