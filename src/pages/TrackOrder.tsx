import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Clock, CheckCircle, AlertCircle, Loader2, CreditCard, Sparkles, MapPin, Mail, ArrowRight, Shield } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

type OrderStatus = "pending" | "in_progress" | "draft_ready" | "revision" | "completed" | "cancelled";
type PaymentStatus = "pending" | "partial" | "paid";

interface Order {
  id: string;
  event_title: string;
  event_type: string;
  event_date: string | null;
  package_name: string;
  total_price: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  preferred_delivery_date: string | null;
  client_email: string;
  deposit_paid: boolean;
  balance_paid: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "bg-yellow-500", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-blue-500", icon: Package },
  draft_ready: { label: "Draft Ready", color: "bg-purple-500", icon: CheckCircle },
  revision: { label: "Revision", color: "bg-orange-500", icon: AlertCircle },
  completed: { label: "Completed", color: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive", icon: AlertCircle },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }> = {
  pending: { label: "Awaiting Deposit", color: "bg-yellow-500" },
  partial: { label: "Deposit Paid", color: "bg-blue-500" },
  paid: { label: "Fully Paid", color: "bg-green-500" },
};

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedOrderId = orderId.trim();
    const trimmedEmail = email.trim();
    
    if (!trimmedOrderId || !trimmedEmail) {
      toast.error("Please enter both order ID and email");
      return;
    }

    // Support both short (8 char) and full UUID format
    let fullOrderId = trimmedOrderId;
    
    // If it's a short ID, we can't expand it - need full UUID for database
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const shortIdRegex = /^[0-9a-f]{8}$/i;
    
    if (!uuidRegex.test(trimmedOrderId) && !shortIdRegex.test(trimmedOrderId)) {
      toast.error("Please enter a valid order ID");
      setOrder(null);
      setSearched(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      // Use secure RPC function with email verification
      const { data, error } = await supabase
        .rpc('get_order_by_id', { 
          order_id: trimmedOrderId,
          customer_email: trimmedEmail 
        });

      if (error) {
        console.error("Error fetching order:", error);
        toast.error("An error occurred while searching");
        setOrder(null);
        return;
      }

      if (data && data.length > 0) {
        setOrder(data[0] as Order);
      } else {
        setOrder(null);
        toast.info("No order found. Please verify your order ID and email match.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayBalance = async () => {
    if (!order) return;

    const balanceAmount = order.total_price * 0.5;
    
    setIsPaymentLoading(true);
    try {
      const callbackUrl = `${window.location.origin}/track-order?payment=success&order=${order.id}`;
      
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: {
          orderId: order.id,
          email: order.client_email,
          amount: balanceAmount,
          paymentType: "balance",
          callbackUrl,
        },
      });

      if (error) throw error;

      if (data.success && data.authorization_url) {
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

  // Check for payment callback on page load
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference");
    const paymentOrderId = urlParams.get("order");
    
    if (reference && paymentOrderId) {
      verifyBalancePayment(reference, paymentOrderId);
    }
  });

  const verifyBalancePayment = async (reference: string, paymentOrderId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: {
          reference,
          orderId: paymentOrderId,
          paymentType: "balance",
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Balance payment successful! Your order is now fully paid.");
        
        // If we have the order loaded, send payment confirmation email, admin notification, and Telegram
        if (order) {
          const paymentData = {
            orderId: order.id,
            clientName: order.event_title, // We don't have client_name in Order type from RPC
            clientEmail: order.client_email,
            eventTitle: order.event_title,
            paymentType: "balance" as const,
            amountPaid: order.total_price * 0.5,
            totalPrice: order.total_price,
            reference,
          };
          
          // Send customer confirmation email
          supabase.functions.invoke("send-payment-confirmation", {
            body: paymentData,
          }).catch((err) => console.error("Failed to send payment confirmation:", err));
          
          // Send admin notification email
          supabase.functions.invoke("send-admin-payment-notification", {
            body: paymentData,
          }).catch((err) => console.error("Failed to send admin notification:", err));
          
          // Send Telegram notification
          supabase.functions.invoke("send-telegram-notification", {
            body: {
              type: "balance",
              orderId: order.id,
              clientName: order.event_title,
              clientEmail: order.client_email,
              eventTitle: order.event_title,
              amount: order.total_price * 0.5,
              paymentMethod: "paystack",
              reference,
            },
          }).catch((err) => console.error("Failed to send Telegram notification:", err));
        }
        
        // Clear URL params
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        toast.error(data.error || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error("Failed to verify payment. Please contact support.");
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIcon = order ? statusConfig[order.order_status].icon : Package;
  const depositAmount = order ? order.total_price * 0.5 : 0;
  const showPayBalanceButton = order && order.deposit_paid && !order.balance_paid;

  return (
    <Layout>
      <SEO
        title="Track Your Order"
        description="Check the status of your VibeLink Events digital invitation order. Enter your order ID to see progress updates."
        canonical="/track-order"
        noindex={true}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

        {/* Floating Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Animated circles */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, 50, 0],
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
            animate={{
              x: [0, -30, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl"
            animate={{
              x: [0, 40, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Sparkle decorations */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                top: `${15 + i * 15}%`,
                left: `${10 + (i % 3) * 35}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              <Sparkles className="h-4 w-4 text-purple-400/40" />
            </motion.div>
          ))}
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-lg py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            {/* Animated Icon */}
            <motion.div
              className="mx-auto mb-6 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl rotate-3 shadow-2xl shadow-purple-500/30 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MapPin className="h-12 w-12 text-white" />
                </motion.div>
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Track Your Order
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Enter your details to check order status
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/50 shadow-2xl shadow-purple-500/10 mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                    <Search className="h-4 w-4" />
                    Order Lookup
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your order ID and email to view status
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your order ID (e.g., a1b2c3d4-...)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-12 h-14 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 h-14 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 hover:from-blue-700 hover:via-purple-700 hover:to-pink-600 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Search Order
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                  <Shield className="h-3 w-3" />
                  <span>Your data is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features */}
          {!searched && (
            <motion.div
              className="grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: Package, label: "Real-time Status", color: "text-blue-500" },
                { icon: Clock, label: "Progress Updates", color: "text-purple-500" },
                { icon: CreditCard, label: "Pay Balance", color: "text-pink-500" },
              ].map((feature) => (
                <motion.div
                  key={feature.label}
                  className="text-center p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <feature.icon className={`h-6 w-6 mx-auto mb-2 ${feature.color}`} />
                  <p className="text-xs font-medium text-muted-foreground">{feature.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}

          <AnimatePresence>
          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {order ? (
                <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/50 shadow-2xl shadow-purple-500/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Order Details</CardTitle>
                      <Badge className={statusConfig[order.order_status].color}>
                        {statusConfig[order.order_status].label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status Progress */}
                    <div className="flex items-center justify-center py-6">
                      <div className={`p-4 rounded-full ${statusConfig[order.order_status].color}`}>
                        <StatusIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>

                    {/* Pay Balance Section */}
                    {showPayBalanceButton && (
                      <div className="bg-accent/10 border border-accent/30 rounded-xl p-6 text-center">
                        <h3 className="text-lg font-bold mb-2">Pay Remaining Balance</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Your deposit has been received. Pay the remaining balance to complete your order.
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <span className="text-2xl font-bold text-accent">
                            GH₵ {depositAmount.toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            (50% balance)
                          </span>
                        </div>
                        <Button
                          onClick={handlePayBalance}
                          disabled={isPaymentLoading}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
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
                              Pay Balance Now
                            </>
                          )}
                        </Button>
                        <p className="text-muted-foreground text-xs mt-3">
                          Secure payment powered by Paystack
                        </p>
                      </div>
                    )}

                    {/* Order Info */}
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Order ID</p>
                          <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Event</p>
                          <p className="font-medium">{order.event_title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{order.event_type}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Package</p>
                          <p className="font-medium">{order.package_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Event Date</p>
                          <p className="font-medium">
                            {order.event_date
                              ? new Date(order.event_date).toLocaleDateString()
                              : "Not set"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="font-bold text-lg">GH₵ {order.total_price}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Status</p>
                          <Badge className={paymentStatusConfig[order.payment_status]?.color || "bg-gray-500"}>
                            {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                          </Badge>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-3">Payment Breakdown</p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">50% Deposit</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">GH₵ {depositAmount.toFixed(2)}</span>
                              {order.deposit_paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">50% Balance</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">GH₵ {depositAmount.toFixed(2)}</span>
                              {order.balance_paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                      <p>Questions about your order?</p>
                      <a
                        href="https://wa.me/4915757178561"
                        className="text-secondary hover:underline"
                      >
                        Contact us on WhatsApp
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-white/50 shadow-2xl">
                  <CardContent className="py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <AlertCircle className="h-8 w-8 text-white" />
                      </div>
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">No Order Found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find an order with that ID or email. Please check and try again.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
