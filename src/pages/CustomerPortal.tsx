import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Package, Clock, Heart, FileEdit, CreditCard,
  LogOut, ChevronRight, Calendar, CheckCircle, AlertCircle, Loader2, Gift,
  Sparkles, PartyPopper, Mail, ArrowRight, Shield
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
import { ReferralProgram } from "@/components/customer/ReferralProgram";

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
  const [isReferralSignup, setIsReferralSignup] = useState(false);
  const [referralName, setReferralName] = useState("");
  const [referralEmail, setReferralEmail] = useState("");

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

  const handleReferralSignup = async () => {
    if (!referralName.trim() || !referralEmail.trim()) {
      toast.error("Please enter your name and email");
      return;
    }

    setIsLoading(true);
    try {
      // Check if referral code already exists for this email
      const { data: existingCode } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("owner_email", referralEmail.toLowerCase())
        .single();

      if (existingCode) {
        // User already has a code, log them in directly
        sessionStorage.setItem("customer_email", referralEmail.toLowerCase());
        sessionStorage.setItem("customer_name", referralName);
        setEmail(referralEmail.toLowerCase());
        setCustomerName(referralName);
        setIsAuthenticated(true);
        fetchCustomerOrders(referralEmail);
        toast.success("Welcome back! Your referral code is ready.");
        return;
      }

      // Generate new referral code
      const prefix = referralName.split(" ")[0].toUpperCase().slice(0, 4);
      const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${prefix}-${suffix}`;

      const { error: insertError } = await supabase
        .from("referral_codes")
        .insert({
          code,
          owner_email: referralEmail.toLowerCase(),
          owner_name: referralName,
          reward_percentage: 10
        });

      if (insertError) throw insertError;

      // Log them in
      sessionStorage.setItem("customer_email", referralEmail.toLowerCase());
      sessionStorage.setItem("customer_name", referralName);
      setEmail(referralEmail.toLowerCase());
      setCustomerName(referralName);
      setIsAuthenticated(true);
      fetchCustomerOrders(referralEmail);
      toast.success("Welcome! Your referral code has been created.");
    } catch (err) {
      console.error("Referral signup error:", err);
      toast.error("Failed to create referral code. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <div className="min-h-screen relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20" />

          {/* Floating Decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Animated circles */}
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-3xl"
              animate={{
                x: [0, -30, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-teal-400/15 to-cyan-400/15 rounded-full blur-3xl"
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

          <div className="container relative z-10 max-w-lg mx-auto px-4 py-16 md:py-24">
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
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl rotate-3 shadow-2xl shadow-purple-500/30 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: [-3, 3, -3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <PartyPopper className="h-12 w-12 text-white" />
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
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Welcome Back!
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Access your beautiful event invitations
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/50 shadow-2xl shadow-purple-500/10">
                <CardContent className="p-8">
                  {/* Toggle between Customer Login and Referral Signup */}
                  <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    <button
                      onClick={() => setIsReferralSignup(false)}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        !isReferralSignup
                          ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Package className="h-4 w-4 inline mr-2" />
                      My Orders
                    </button>
                    <button
                      onClick={() => setIsReferralSignup(true)}
                      className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                        isReferralSignup
                          ? "bg-white dark:bg-gray-700 shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Gift className="h-4 w-4 inline mr-2" />
                      Get Referral Code
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {isReferralSignup ? (
                      <motion.div
                        key="referral-signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-5"
                      >
                        <div className="text-center mb-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium mb-3">
                            <Gift className="h-4 w-4" />
                            Earn Cash Rewards
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Sign up to get your unique referral code and earn money!
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Input
                            type="text"
                            placeholder="Your full name"
                            value={referralName}
                            onChange={(e) => setReferralName(e.target.value)}
                            className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl"
                          />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={referralEmail}
                            onChange={(e) => setReferralEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleReferralSignup()}
                            className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-green-500 rounded-xl"
                          />
                        </div>

                        <Button
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
                          onClick={handleReferralSignup}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <Gift className="mr-2 h-5 w-5" />
                              Get My Referral Code
                            </>
                          )}
                        </Button>

                        <div className="bg-secondary/10 rounded-lg p-3 text-xs text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Earn per referral:</p>
                          <p>Classic: GHS 100 • Prestige: GHS 200 • Royal: GHS 500</p>
                        </div>
                      </motion.div>
                    ) : !showOtpInput ? (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                            <Mail className="h-4 w-4" />
                            Secure Email Login
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Enter the email you used when placing your order
                          </p>
                        </div>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                            className="pl-12 h-14 text-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 rounded-xl"
                          />
                        </div>

                        <Button
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]"
                          onClick={sendOtp}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              Continue
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>Your data is secure and encrypted</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="otp"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" }}
                          >
                            <Mail className="h-8 w-8 text-white" />
                          </motion.div>
                          <h3 className="text-xl font-semibold mb-2">Check your inbox!</h3>
                          <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to
                          </p>
                          <p className="font-medium text-purple-600 dark:text-purple-400">{email}</p>
                        </div>

                        <div>
                          <Input
                            type="text"
                            placeholder="• • • • • •"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="text-center text-3xl tracking-[0.5em] h-16 font-mono bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 rounded-xl"
                            onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                            autoFocus
                          />
                        </div>

                        <Button
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02]"
                          onClick={verifyOtp}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              Verify & Enter
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground hover:text-foreground"
                          onClick={() => setShowOtpInput(false)}
                        >
                          <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                          Use different email
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
              className="mt-12 grid grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {[
                { icon: Package, label: "Track Orders", color: "text-purple-500" },
                { icon: Heart, label: "Saved Designs", color: "text-pink-500" },
                { icon: Gift, label: "Earn Rewards", color: "text-orange-500" },
              ].map((feature, i) => (
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
                  <TabsList className="grid w-full grid-cols-5">
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
                    <TabsTrigger value="referral">
                      <Gift className="h-4 w-4 mr-2 hidden sm:block" />
                      Referral
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

                  <TabsContent value="referral">
                    <ReferralProgram customerEmail={email} customerName={customerName} />
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

