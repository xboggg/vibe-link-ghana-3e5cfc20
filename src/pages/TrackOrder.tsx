import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Package, Clock, CheckCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";
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
        
        // If we have the order loaded, send payment confirmation email and admin notification
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
          
          // Send admin notification
          supabase.functions.invoke("send-admin-payment-notification", {
            body: paymentData,
          }).catch((err) => console.error("Failed to send admin notification:", err));
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
        description="Check the status of your VibeLink Ghana digital invitation order. Enter your order ID to see progress updates."
        canonical="/track-order"
        noindex={true}
      />
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
              Track Your <span className="text-secondary">Order</span>
            </h1>
            <p className="text-muted-foreground">
              Enter your order ID and email address to check your order status
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="mb-8">
              <CardContent className="pt-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your order ID (e.g., a1b2c3d4-...)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {searched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {order ? (
                <Card>
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
                        href="https://wa.me/233245817973"
                        className="text-secondary hover:underline"
                      >
                        Contact us on WhatsApp
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Order Found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find an order with that ID or email. Please check and try again.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
