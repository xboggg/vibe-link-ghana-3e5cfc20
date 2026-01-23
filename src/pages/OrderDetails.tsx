import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, Clock, CheckCircle, AlertCircle, Loader2,
  Printer, Download, ArrowLeft, Calendar,
  CreditCard, Mail, Sparkles, FileText
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";

type OrderStatus = "pending" | "in_progress" | "draft_ready" | "revision" | "completed" | "cancelled";
type PaymentStatus = "pending" | "partial" | "paid" | "fully_paid";

interface OrderDetails {
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
}

const getPaymentFlags = (paymentStatus: string) => ({
  deposit_paid: paymentStatus === "partial" || paymentStatus === "paid" || paymentStatus === "fully_paid",
  balance_paid: paymentStatus === "paid" || paymentStatus === "fully_paid",
});

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: typeof Package }> = {
  pending: { label: "Pending", color: "text-yellow-600", bgColor: "bg-yellow-500", icon: Clock },
  in_progress: { label: "In Progress", color: "text-blue-600", bgColor: "bg-blue-500", icon: Package },
  draft_ready: { label: "Draft Ready", color: "text-purple-600", bgColor: "bg-purple-500", icon: CheckCircle },
  revision: { label: "Revision", color: "text-orange-600", bgColor: "bg-orange-500", icon: AlertCircle },
  completed: { label: "Completed", color: "text-green-600", bgColor: "bg-green-500", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-500", icon: AlertCircle },
};

const paymentStatusConfig: Record<PaymentStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Awaiting Payment", color: "text-yellow-600", bgColor: "bg-yellow-500" },
  partial: { label: "Deposit Paid", color: "text-blue-600", bgColor: "bg-blue-500" },
  paid: { label: "Fully Paid", color: "text-green-600", bgColor: "bg-green-500" },
  fully_paid: { label: "Fully Paid", color: "text-green-600", bgColor: "bg-green-500" },
};

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const email = searchParams.get("email");

  useEffect(() => {
    if (orderId && email) {
      fetchOrderDetails();
    } else {
      setError("Invalid order link. Please use the link from your confirmation email.");
      setIsLoading(false);
    }
  }, [orderId, email]);

  const fetchOrderDetails = async () => {
    if (!orderId || !email) return;

    setIsLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_order_by_id', {
          order_id: orderId,
          customer_email: email
        });

      if (fetchError) {
        console.error("Error fetching order:", fetchError);
        setError("Could not load order details. Please check your link.");
        return;
      }

      if (data && data.length > 0) {
        setOrder(data[0] as OrderDetails);
      } else {
        setError("Order not found. Please verify your order ID and email.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while loading order details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    toast.info("Generating PDF...");

    // Create a simple PDF-friendly content
    const printContent = document.getElementById('print-content');
    if (!printContent) return;

    // Open print dialog which allows saving as PDF
    window.print();
    toast.success("Use 'Save as PDF' in the print dialog to download");
  };

  const handleBack = () => {
    navigate('/track-order');
  };

  const StatusIcon = order ? statusConfig[order.order_status].icon : Package;
  const depositAmount = order ? order.total_price * 0.5 : 0;
  const paymentFlags = order ? getPaymentFlags(order.payment_status) : { deposit_paid: false, balance_paid: false };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <SEO title="Order Not Found" noindex={true} />
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-6">
                {error || "We couldn't find this order. Please check your link or try searching again."}
              </p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Track Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={`Order #${order.id.slice(0, 8).toUpperCase()} - VibeLink Events`}
        description="View your order details, payment status, and event information."
        noindex={true}
      />

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-content, #print-content * {
            visibility: visible;
          }
          #print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

        <div className="container relative z-10 mx-auto px-4 max-w-3xl py-8 md:py-12">
          {/* Action Buttons - No Print */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print"
          >
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Track Order
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Save as PDF
              </Button>
            </div>
          </motion.div>

          {/* Printable Content */}
          <div id="print-content" ref={printRef}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  VibeLink Events
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Confirmation</h1>
              <p className="text-muted-foreground">
                Order #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </motion.div>

            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-6 print-break">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${statusConfig[order.order_status].bgColor}`}>
                        <StatusIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order Status</p>
                        <p className={`text-lg font-semibold ${statusConfig[order.order_status].color}`}>
                          {statusConfig[order.order_status].label}
                        </p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge className={paymentStatusConfig[order.payment_status]?.bgColor || "bg-gray-500"}>
                        {paymentStatusConfig[order.payment_status]?.label || order.payment_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-6 print-break">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-500" />
                    Order Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order ID</p>
                      <p className="font-mono font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Package</p>
                    <p className="font-semibold text-lg">{order.package_name}</p>
                  </div>

                                  </CardContent>
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="mb-6 print-break">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Event Title</p>
                      <p className="font-medium">{order.event_title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Event Type</p>
                      <p className="font-medium capitalize">{order.event_type}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium">
                      {order.event_date
                        ? new Date(order.event_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'To be confirmed'}
                    </p>
                  </div>

                  {order.preferred_delivery_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preferred Delivery Date</p>
                      <p className="font-medium">
                        {new Date(order.preferred_delivery_date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                                  </CardContent>
              </Card>
            </motion.div>

            {/* Payment Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="mb-6 print-break">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">50% Deposit</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">GH₵ {depositAmount.toFixed(2)}</span>
                        {paymentFlags.deposit_paid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">50% Balance</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">GH₵ {depositAmount.toFixed(2)}</span>
                        {paymentFlags.balance_paid ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-purple-600">
                        GH₵ {order.total_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="print-break">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-purple-500" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-20">Email:</span>
                    <span className="font-medium">{order.client_email}</span>
                  </div>

                  <Separator className="my-4" />

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Questions about your order?</p>
                    <a
                      href="https://wa.me/4915757178561"
                      className="text-purple-600 hover:underline font-medium"
                    >
                      Contact us on WhatsApp
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-8 text-sm text-muted-foreground"
            >
              <p>Thank you for choosing VibeLink Events!</p>
              <p className="mt-1">www.vibelinkgh.com</p>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
