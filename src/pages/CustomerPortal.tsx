import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Package, Clock, Heart, FileEdit, CreditCard,
  LogOut, ChevronRight, Calendar, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { format } from "date-fns";
import { OrderTimeline } from "@/components/customer/OrderTimeline";
import { RevisionRequest } from "@/components/customer/RevisionRequest";
import { SavedDesigns } from "@/components/customer/SavedDesigns";

interface CustomerOrder {
  id: string;
  event_title: string;
  event_type: string;
  event_date: string | null;
  package_name: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  client_name: string;
  client_email: string;
  deposit_paid: boolean;
  balance_paid: boolean;
}

export default function CustomerPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("customer_email");
    const savedName = sessionStorage.getItem("customer_name");
    if (savedEmail) {
      setEmail(savedEmail);
      setCustomerName(savedName || "");
      setIsAuthenticated(true);
      fetchCustomerOrders(savedEmail);
    }
  }, []);

  const sendOtp = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    try {
      const { data: orderCheck } = await supabase
        .from("orders")
        .select("client_name")
        .eq("client_email", email.toLowerCase())
        .limit(1);

      if (!orderCheck || orderCheck.length === 0) {
        toast.error("No orders found with this email");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.functions.invoke("send-customer-otp", {
        body: { email: email.toLowerCase() }
      });

      if (error) throw error;

      setShowOtpInput(true);
      setCustomerName(orderCheck[0].client_name);
      toast.success("Verification code sent to your email!");
    } catch (err) {
      console.error("OTP error:", err);
      toast.error("Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-customer-otp", {
        body: { email: email.toLowerCase(), otp }
      });

      if (error || !data?.verified) {
        toast.error("Invalid or expired code");
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("customer_email", email.toLowerCase());
      sessionStorage.setItem("customer_name", customerName);
      setIsAuthenticated(true);
      fetchCustomerOrders(email);
      toast.success("Welcome back!");
    } catch (err) {
      console.error("Verify error:", err);
      toast.error("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerEmail: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("client_email", customerEmail.toLowerCase())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      if (data && data.length > 0) {
        setSelectedOrder(data[0]);
        setCustomerName(data[0].client_name);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      toast.error("Failed to load orders");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("customer_email");
    sessionStorage.removeItem("customer_name");
    setIsAuthenticated(false);
    setOrders([]);
    setSelectedOrder(null);
    setEmail("");
    setOtp("");
    setShowOtpInput(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      draft_ready: "bg-purple-500",
      revision: "bg-orange-500",
      completed: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <SEO
          title="Customer Portal | VibeLink Events"
          description="Access your orders, track progress, and manage your event invitations"
        />
        <div className="min-h-screen py-20">
          <div className="container max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Customer Portal</CardTitle>
                  <CardDescription>
                    Enter your email to access your orders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!showOtpInput ? (
                    <>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                      />
                      <Button
                        className="w-full"
                        onClick={sendOtp}
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Continue
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground text-center">
                        We sent a 6-digit code to {email}
                      </p>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="text-center text-2xl tracking-widest"
                        onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                      />
                      <Button
                        className="w-full"
                        onClick={verifyOtp}
                        disabled={isLoading}
                      >
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Verify
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => setShowOtpInput(false)}
                      >
                        Use different email
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title="My Orders | VibeLink Events"
        description="View and manage your event invitation orders"
      />
      <div className="min-h-screen py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {customerName.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome, {customerName.split(" ")[0]}!</h1>
                <p className="text-muted-foreground">{email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    My Orders ({orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedOrder?.id === order.id
                          ? "bg-primary/10 border-primary border"
                          : "hover:bg-muted border border-transparent"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm truncate flex-1">
                          {order.event_title}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(order.order_status)} text-xs`}>
                          {order.order_status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d")}
                        </span>
                      </div>
                    </button>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No orders yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {selectedOrder ? (
                <Tabs defaultValue="timeline" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="timeline">
                      <Clock className="h-4 w-4 mr-2 hidden sm:block" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      <Package className="h-4 w-4 mr-2 hidden sm:block" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="revision">
                      <FileEdit className="h-4 w-4 mr-2 hidden sm:block" />
                      Revision
                    </TabsTrigger>
                    <TabsTrigger value="saved">
                      <Heart className="h-4 w-4 mr-2 hidden sm:block" />
                      Saved
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="timeline">
                    <OrderTimeline order={selectedOrder} />
                  </TabsContent>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>{selectedOrder.event_title}</CardTitle>
                        <CardDescription>Order #{selectedOrder.id.slice(0, 8)}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Event Type</p>
                            <p className="font-medium">{selectedOrder.event_type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Package</p>
                            <p className="font-medium">{selectedOrder.package_name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Event Date</p>
                            <p className="font-medium">
                              {selectedOrder.event_date
                                ? format(new Date(selectedOrder.event_date), "MMMM d, yyyy")
                                : "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Price</p>
                            <p className="font-medium">GH???{selectedOrder.total_price.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-sm text-muted-foreground mb-2">Payment Status</p>
                          <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                              {selectedOrder.deposit_paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm">Deposit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedOrder.balance_paid ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-sm">Balance</span>
                            </div>
                          </div>
                        </div>

                        {!selectedOrder.balance_paid && selectedOrder.deposit_paid && (
                          <Button className="w-full">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Balance (GH???{(selectedOrder.total_price * 0.7).toLocaleString()})
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="revision">
                    <RevisionRequest order={selectedOrder} />
                  </TabsContent>

                  <TabsContent value="saved">
                    <SavedDesigns customerEmail={email} />
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Select an order to view details</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

