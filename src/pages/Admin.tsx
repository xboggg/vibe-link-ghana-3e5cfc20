import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Loader2,
  LogOut,
  Package,
  DollarSign,
  Calendar,
  Users,
  Clock,
  Eye,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Bell,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  Zap,
  FileText,
  Settings,
  Shield,
  Menu,
  X,
  Home,
  TrendingUp,
  CreditCard,
  LayoutDashboard,
  Quote,
  Newspaper,
  UsersRound,
  Gift,
  ShoppingCart,
  Tag,
  Receipt,
  Wallet,
  PieChart,
  ClipboardList,
  FileStack,
  Download,
  Sparkles,
  Brain,
  AlertTriangle,
  PenTool,
  Target,
  Globe,
  Gauge,
  Link2,
  ExternalLink,
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { OrderAnalytics } from "@/components/admin/OrderAnalytics";
import { ReportBuilder } from "@/components/admin/ReportBuilder";
import { CampaignAnalytics } from "@/components/admin/CampaignAnalytics";
import { FollowUpHistory } from "@/components/admin/FollowUpHistory";
import { FollowUpSettings } from "@/components/admin/FollowUpSettings";
import { BlogManager } from "@/components/admin/BlogManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { NewsletterManager } from "@/components/admin/NewsletterManager";
import { SubscriberPreferences } from "@/components/admin/SubscriberPreferences";
import { ChatAnalytics } from "@/components/admin/ChatAnalytics";
import { TeamManager } from "@/components/admin/TeamManager";
import { AbandonedCartRecovery } from "@/components/admin/AbandonedCartRecovery";
import { CouponManagerAdmin } from "@/components/admin/CouponManagerAdmin";
import { ReferralsAdmin } from "@/components/admin/ReferralsAdmin";
import { InvoiceGenerator } from "@/components/admin/InvoiceGenerator";
import { ExpenseTracker } from "@/components/admin/ExpenseTracker";
import { FinancialReports } from "@/components/admin/FinancialReports";
import { CustomerSurveys } from "@/components/admin/CustomerSurveys";
import { OrderTemplates } from "@/components/admin/OrderTemplates";
import { BackupExportSystem } from "@/components/admin/BackupExportSystem";
import { AIEmailTemplates } from "@/components/admin/AIEmailTemplates";
import { AIOrderSummarizer } from "@/components/admin/AIOrderSummarizer";
import { ChatbotEscalation } from "@/components/admin/ChatbotEscalation";
import { AIBlogWriter } from "@/components/admin/AIBlogWriter";
import { CustomerSegmentation } from "@/components/admin/CustomerSegmentation";
import { SEOContentCalendar } from "@/components/admin/SEOContentCalendar";
import { ConversionFunnelAnalytics } from "@/components/admin/ConversionFunnelAnalytics";
import { MultiCurrencySupport } from "@/components/admin/MultiCurrencySupport";
import { MultiLanguageSupport } from "@/components/admin/MultiLanguageSupport";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/admin/CalendarView";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

interface ReminderLog {
  id: string;
  order_id: string;
  reminder_type: string;
  sent_at: string;
  recipient_email: string;
  success: boolean;
  error_message: string | null;
}

interface PaymentHistoryLog {
  id: string;
  order_id: string;
  payment_type: string;
  payment_method: string;
  amount: number;
  reference: string | null;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
}

interface RevisionRequest {
  id: string;
  order_id: string;
  request_text: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

type AdminSection = "dashboard" | "orders" | "analytics" | "chatbot" | "blog" | "testimonials" | "newsletter" | "follow-ups" | "email-settings" | "users" | "team" | "abandoned-carts" | "coupons" | "referrals" | "invoices" | "expenses" | "reports" | "surveys" | "templates" | "backup" | "ai-emails" | "ai-summary" | "escalations" | "segmentation" | "seo-calendar" | "funnel" | "currency" | "languages";

const orderStatusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  draft_ready: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  revision: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  deposit_paid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  fully_paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

// Grouped navigation categories
const navCategories = [
  {
    category: "Main",
    icon: LayoutDashboard,
    items: [
      { id: "dashboard" as AdminSection, label: "Dashboard", icon: LayoutDashboard },
      { id: "orders" as AdminSection, label: "Orders", icon: Package },
    ],
  },
  {
    category: "Analytics",
    icon: BarChart3,
    items: [
      { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
      { id: "chatbot" as AdminSection, label: "Chatbot", icon: MessageCircle },
      { id: "funnel" as AdminSection, label: "Funnel", icon: Gauge },
    ],
  },
  {
    category: "Content",
    icon: FileText,
    items: [
      { id: "blog" as AdminSection, label: "Blog", icon: FileText },
      { id: "testimonials" as AdminSection, label: "Testimonials", icon: Quote },
      { id: "team" as AdminSection, label: "Team", icon: UsersRound },
      { id: "newsletter" as AdminSection, label: "Newsletter", icon: Newspaper },
    ],
  },
  {
    category: "Marketing",
    icon: Target,
    items: [
      { id: "coupons" as AdminSection, label: "Coupons", icon: Tag },
      { id: "referrals" as AdminSection, label: "Referrals", icon: Gift },
      { id: "abandoned-carts" as AdminSection, label: "Abandoned Carts", icon: ShoppingCart },
      { id: "segmentation" as AdminSection, label: "Segments", icon: Target },
      { id: "seo-calendar" as AdminSection, label: "SEO Calendar", icon: Calendar },
    ],
  },
  {
    category: "Finance",
    icon: Wallet,
    items: [
      { id: "invoices" as AdminSection, label: "Invoices", icon: Receipt },
      { id: "expenses" as AdminSection, label: "Expenses", icon: Wallet },
      { id: "reports" as AdminSection, label: "Reports", icon: PieChart },
    ],
  },
  {
    category: "Automation",
    icon: Sparkles,
    items: [
      { id: "follow-ups" as AdminSection, label: "Follow-ups", icon: Send },
      { id: "email-settings" as AdminSection, label: "Email Settings", icon: Mail },
      { id: "ai-emails" as AdminSection, label: "AI Emails", icon: Sparkles },
      { id: "ai-summary" as AdminSection, label: "AI Summary", icon: Brain },
      { id: "escalations" as AdminSection, label: "Escalations", icon: AlertTriangle },
    ],
  },
  {
    category: "System",
    icon: Settings,
    items: [
      { id: "users" as AdminSection, label: "User Management", icon: Shield },
      { id: "surveys" as AdminSection, label: "Surveys", icon: ClipboardList },
      { id: "templates" as AdminSection, label: "Templates", icon: FileStack },
      { id: "backup" as AdminSection, label: "Backup", icon: Download },
      { id: "currency" as AdminSection, label: "Currency", icon: DollarSign },
      { id: "languages" as AdminSection, label: "Languages", icon: Globe },
    ],
  },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, checkingAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [runningFollowUps, setRunningFollowUps] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState<"deposit" | "balance" | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryLog[]>([]);
  const [loadingPaymentHistory, setLoadingPaymentHistory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Main"]);
  const [finalLink, setFinalLink] = useState("");
  const [savingFinalLink, setSavingFinalLink] = useState(false);
  const [revisionRequests, setRevisionRequests] = useState<RevisionRequest[]>([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [respondingToRevision, setRespondingToRevision] = useState<string | null>(null);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Handle menu click with scroll to top
  const handleMenuClick = (sectionId: AdminSection, category: string) => {
    setActiveSection(sectionId);
    setSidebarOpen(false);
    // Expand the category if not already expanded
    if (!expandedCategories.includes(category)) {
      setExpandedCategories(prev => [...prev, category]);
    }
    // Scroll main content to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchOrders();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (selectedOrder) {
      fetchReminderLogs(selectedOrder.id);
      fetchPaymentHistory(selectedOrder.id);
      fetchRevisionRequests(selectedOrder.id);
      setFinalLink((selectedOrder as any).final_link || "");
    } else {
      setReminderLogs([]);
      setPaymentHistory([]);
      setRevisionRequests([]);
      setFinalLink("");
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } else {
      setOrders(data || []);
    }
    setLoadingOrders(false);
  };

  const fetchReminderLogs = async (orderId: string) => {
    setLoadingReminders(true);
    const { data, error } = await supabase
      .from("payment_reminder_logs")
      .select("*")
      .eq("order_id", orderId)
      .order("sent_at", { ascending: false });

    if (error) {
      console.error("Error fetching reminder logs:", error);
    } else {
      setReminderLogs((data as ReminderLog[]) || []);
    }
    setLoadingReminders(false);
  };

  const fetchPaymentHistory = async (orderId: string) => {
    setLoadingPaymentHistory(true);
    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching payment history:", error);
    } else {
      setPaymentHistory((data as PaymentHistoryLog[]) || []);
    }
    setLoadingPaymentHistory(false);
  };

  const fetchRevisionRequests = async (orderId: string) => {
    setLoadingRevisions(true);
    const { data, error } = await supabase
      .from("order_revisions")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching revision requests:", error);
    } else {
      setRevisionRequests((data as RevisionRequest[]) || []);
    }
    setLoadingRevisions(false);
  };

  const respondToRevision = async (revisionId: string, status: "in_progress" | "completed") => {
    if (!adminResponse.trim() && status === "completed") {
      toast.error("Please add a response before marking as completed");
      return;
    }

    setRespondingToRevision(revisionId);
    try {
      const { error } = await supabase
        .from("order_revisions")
        .update({
          status,
          admin_response: adminResponse.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", revisionId);

      if (error) throw error;

      // If completed, update order status back to draft_ready
      if (status === "completed" && selectedOrder) {
        await supabase
          .from("orders")
          .update({ order_status: "draft_ready" })
          .eq("id", selectedOrder.id);
        fetchOrders();
      }

      toast.success(status === "completed" ? "Revision completed!" : "Revision marked as in progress");
      setAdminResponse("");
      if (selectedOrder) {
        fetchRevisionRequests(selectedOrder.id);
      }
    } catch (err) {
      console.error("Error responding to revision:", err);
      toast.error("Failed to update revision");
    } finally {
      setRespondingToRevision(null);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);

    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success("Order status updated");

      // If order is completed, also mark all pending/in-progress revisions as completed
      if (status === "completed") {
        await supabase
          .from("order_revisions")
          .update({
            status: "completed",
            admin_response: "Order completed",
            updated_at: new Date().toISOString()
          })
          .eq("order_id", orderId)
          .in("status", ["pending", "in_progress"]);
      }

      if (order) {
        sendStatusEmail(order, status);
      }
      fetchOrders();
    }
  };

  const sendStatusEmail = async (order: Order, newStatus: string, newPaymentStatus?: string) => {
    try {
      const { error } = await supabase.functions.invoke('send-status-email', {
        body: {
          clientName: order.client_name,
          clientEmail: order.client_email,
          eventTitle: order.event_title,
          orderId: order.id,
          orderStatus: newStatus,
          paymentStatus: newPaymentStatus || order.payment_status,
        },
      });

      if (error) {
        console.error("Error sending status email:", error);
      } else {
        toast.success("Status email sent to customer");
      }
    } catch (err) {
      console.error("Error invoking email function:", err);
    }
  };

  const sendPaymentReminder = async (order: Order) => {
    try {
      const { error } = await supabase.functions.invoke('send-payment-reminder', {
        body: {
          clientName: order.client_name,
          clientEmail: order.client_email,
          orderId: order.id,
          eventTitle: order.event_title,
          eventType: order.event_type,
          eventDate: order.event_date,
          packageName: order.package_name,
          totalPrice: order.total_price,
          paymentStatus: order.payment_status,
        },
      });

      if (error) {
        console.error("Error sending payment reminder:", error);
        toast.error("Failed to send payment reminder");
      } else {
        toast.success("Payment reminder sent to customer");
      }
    } catch (err) {
      console.error("Error invoking payment reminder function:", err);
      toast.error("Failed to send payment reminder");
    }
  };

  const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    const order = orders.find(o => o.id === orderId);
    const now = new Date().toISOString();

    // Build update object based on payment status
    const updateData: Record<string, unknown> = { payment_status: status };

    // Sync the boolean flags and timestamps with the payment status
    if (status === "fully_paid") {
      updateData.deposit_paid = true;
      updateData.balance_paid = true;
      updateData.deposit_paid_at = now;
      updateData.balance_paid_at = now;
    } else if (status === "deposit_paid") {
      updateData.deposit_paid = true;
      updateData.deposit_paid_at = now;
      updateData.balance_paid = false;
      updateData.balance_paid_at = null;
    } else if (status === "pending") {
      updateData.deposit_paid = false;
      updateData.deposit_paid_at = null;
      updateData.balance_paid = false;
      updateData.balance_paid_at = null;
    }

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update payment status");
    } else {
      toast.success("Payment status updated");
      if (order) {
        sendStatusEmail(order, order.order_status, status);
      }
      fetchOrders();
    }
  };

  const runFollowUpEmails = async () => {
    setRunningFollowUps(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-follow-up-emails');

      if (error) {
        console.error("Error running follow-up emails:", error);
        toast.error("Failed to run follow-up emails");
      } else {
        const totalSent = data?.totalSent || 0;
        const totalErrors = data?.totalErrors || 0;
        if (totalSent > 0) {
          toast.success(`Sent ${totalSent} follow-up email${totalSent > 1 ? 's' : ''}`);
        } else if (totalErrors > 0) {
          toast.error(`${totalErrors} email${totalErrors > 1 ? 's' : ''} failed to send`);
        } else {
          toast.info("No follow-up emails needed at this time");
        }
      }
    } catch (err) {
      console.error("Error invoking follow-up function:", err);
      toast.error("Failed to run follow-up emails");
    } finally {
      setRunningFollowUps(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/auth");
  };

  const recordManualPayment = async (paymentType: "deposit" | "balance") => {
    if (!selectedOrder) return;
    
    setRecordingPayment(paymentType);
    
    const now = new Date().toISOString();
    const amountPaid = Number(selectedOrder.total_price) * 0.5;
    const reference = paymentReference.trim() || `MANUAL-${Date.now()}`;
    
    try {
      const updateData = paymentType === "deposit" 
        ? {
            deposit_paid: true,
            deposit_paid_at: now,
            deposit_reference: reference,
            deposit_amount: amountPaid,
            payment_status: "deposit_paid" as PaymentStatus,
          }
        : {
            balance_paid: true,
            balance_paid_at: now,
            balance_reference: reference,
            balance_amount: amountPaid,
            payment_status: "fully_paid" as PaymentStatus,
          };
      
      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", selectedOrder.id);
      
      if (error) throw error;
      
      toast.success(`${paymentType === "deposit" ? "Deposit" : "Balance"} recorded successfully!`);
      
      // Send confirmation email to customer
      supabase.functions.invoke("send-payment-confirmation", {
        body: {
          orderId: selectedOrder.id,
          clientName: selectedOrder.client_name,
          clientEmail: selectedOrder.client_email,
          eventTitle: selectedOrder.event_title,
          paymentType,
          amountPaid,
          totalPrice: Number(selectedOrder.total_price),
          reference,
        },
      }).catch((err) => console.error("Failed to send confirmation:", err));
      
      // Send admin notification email
      supabase.functions.invoke("send-admin-payment-notification", {
        body: {
          orderId: selectedOrder.id,
          clientName: selectedOrder.client_name,
          clientEmail: selectedOrder.client_email,
          clientPhone: selectedOrder.client_phone,
          eventTitle: selectedOrder.event_title,
          paymentType,
          amountPaid,
          totalPrice: Number(selectedOrder.total_price),
          reference,
          paymentMethod: "Manual (Cash/Bank Transfer)",
        },
      }).catch((err) => console.error("Failed to send admin notification:", err));
      
      // Send Telegram notification
      supabase.functions.invoke("send-telegram-notification", {
        body: {
          type: paymentType,
          orderId: selectedOrder.id,
          clientName: selectedOrder.client_name,
          clientEmail: selectedOrder.client_email,
          eventTitle: selectedOrder.event_title,
          amount: amountPaid,
          paymentMethod: "bank_transfer",
          reference,
        },
      }).catch((err) => console.error("Failed to send Telegram notification:", err));
      
      // Log payment to payment_history table
      await supabase
        .from("payment_history")
        .insert({
          order_id: selectedOrder.id,
          payment_type: paymentType,
          payment_method: "bank_transfer",
          amount: amountPaid,
          reference: reference,
          recorded_by: user?.email || "admin",
        });
      
      setPaymentReference("");
      fetchOrders();
      
      // Refresh selected order with new data
      const { data: updatedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", selectedOrder.id)
        .single();
      
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
        fetchPaymentHistory(updatedOrder.id);
      }
    } catch (err) {
      console.error("Error recording payment:", err);
      toast.error("Failed to record payment");
    } finally {
      setRecordingPayment(null);
    }
  };

  const saveFinalLink = async () => {
    if (!selectedOrder) return;

    setSavingFinalLink(true);
    try {
      // Cast to any since final_link column will be added via migration
      const { error } = await supabase
        .from("orders")
        .update({ final_link: finalLink.trim() || null } as any)
        .eq("id", selectedOrder.id);

      if (error) throw error;

      toast.success("Final link saved!");

      // Refresh selected order
      const { data: updatedOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", selectedOrder.id)
        .single();

      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }

      fetchOrders();
    } catch (err) {
      console.error("Error saving final link:", err);
      toast.error("Failed to save final link");
    } finally {
      setSavingFinalLink(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return order.order_status === "pending";
    if (activeTab === "in_progress") return order.order_status === "in_progress";
    if (activeTab === "completed") return order.order_status === "completed";
    return true;
  });

  // Statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === "pending").length;
  const totalRevenue = orders
    .filter((o) => o.payment_status === "fully_paid")
    .reduce((sum, o) => sum + Number(o.total_price), 0);
  const depositReceived = orders
    .filter((o) => o.payment_status === "deposit_paid")
    .reduce((sum, o) => sum + Number(o.total_price) * 0.5, 0);
  const pendingPayments = orders
    .filter((o) => o.payment_status === "pending")
    .reduce((sum, o) => sum + Number(o.total_price), 0) +
    orders
    .filter((o) => o.payment_status === "deposit_paid")
    .reduce((sum, o) => sum + Number(o.total_price) * 0.5, 0);
  const thisMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges. Contact the administrator.
          </p>
          <Button onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Welcome back!</h1>
                <p className="text-muted-foreground">Here's what's happening with your business today.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={runFollowUpEmails}
                  disabled={runningFollowUps}
                >
                  {runningFollowUps ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Run Follow-ups
                </Button>
                <Button variant="outline" onClick={fetchOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                      <p className="text-3xl font-bold">{totalOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">{thisMonthOrders} this month</p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                      <p className="text-3xl font-bold">{pendingOrders}</p>
                      <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
                    </div>
                    <div className="p-3 rounded-xl bg-yellow-500/10">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold">₵{totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Fully paid orders</p>
                    </div>
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <span className="text-2xl font-bold text-green-600">₵</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Deposits</p>
                      <p className="text-3xl font-bold">₵{depositReceived.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Partial payments</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                      <p className="text-3xl font-bold">₵{pendingPayments.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10">
                      <Wallet className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your customers</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setActiveSection("orders")}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{order.event_title}</p>
                            <p className="text-sm text-muted-foreground">{order.client_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={orderStatusColors[order.order_status]}>
                            {order.order_status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm font-medium">₵{Number(order.total_price).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <p className="text-muted-foreground">Manage and track all customer orders</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <Package className="h-4 w-4 mr-1" />
                  List
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </Button>
              </div>
            </div>

            {viewMode === "calendar" ? (
              <CalendarView orders={orders} onSelectOrder={setSelectedOrder} />
            ) : (
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                      <TabsTrigger value="pending">Pending ({pendingOrders})</TabsTrigger>
                      <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No orders found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Event</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.map((order) => (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedOrder(order)}>
                              <TableCell className="font-medium">{order.event_title}</TableCell>
                              <TableCell>{order.client_name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{order.event_type}</Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={order.order_status}
                                  onValueChange={(value) => {
                                    updateOrderStatus(order.id, value as OrderStatus);
                                  }}
                                >
                                  <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
                                    <Badge className={orderStatusColors[order.order_status]}>
                                      {order.order_status.replace("_", " ")}
                                    </Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="draft_ready">Draft Ready</SelectItem>
                                    <SelectItem value="revision">Revision</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={order.payment_status}
                                  onValueChange={(value) => {
                                    updatePaymentStatus(order.id, value as PaymentStatus);
                                  }}
                                >
                                  <SelectTrigger className="w-[130px]" onClick={(e) => e.stopPropagation()}>
                                    <Badge className={paymentStatusColors[order.payment_status]}>
                                      {order.payment_status.replace("_", " ")}
                                    </Badge>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                                    <SelectItem value="fully_paid">Fully Paid</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="font-medium">₵{Number(order.total_price).toLocaleString()}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(order.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="mb-4 flex-wrap h-auto gap-1">
                <TabsTrigger value="orders">Order Analytics</TabsTrigger>
                <TabsTrigger value="traffic">Site Traffic</TabsTrigger>
                <TabsTrigger value="reports">Report Builder</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              </TabsList>
              <TabsContent value="orders">
                <OrderAnalytics />
              </TabsContent>
              <TabsContent value="traffic">
                <AnalyticsDashboard />
              </TabsContent>
              <TabsContent value="reports">
                <ReportBuilder />
              </TabsContent>
              <TabsContent value="campaigns">
                <CampaignAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        );

      case "chatbot":
        return <ChatAnalytics />;

      case "blog":
        return <BlogManager />;

      case "testimonials":
        return <TestimonialsManager />;

      case "newsletter":
        return (
          <div className="space-y-8">
            <NewsletterManager />
            <SubscriberPreferences />
          </div>
        );

      case "follow-ups":
        return <FollowUpHistory />;

      case "email-settings":
        return <FollowUpSettings />;

      case "users":
        return <UserManagement />;

      case "abandoned-carts":
        return <AbandonedCartRecovery />;

      case "coupons":
        return <CouponManagerAdmin />;

      case "referrals":
        return <ReferralsAdmin />;

      case "invoices":
        return <InvoiceGenerator />;

      case "expenses":
        return <ExpenseTracker />;

      case "reports":
        return <FinancialReports />;

      case "surveys":
        return <CustomerSurveys />;

      case "templates":
        return <OrderTemplates />;

      case "backup":
        return <BackupExportSystem />;

      case "ai-emails":
        return <AIEmailTemplates />;

      case "ai-summary":
        return <AIOrderSummarizer />;

      case "escalations":
        return <ChatbotEscalation />;

      case "segmentation":
        return <CustomerSegmentation />;

      case "seo-calendar":
        return <SEOContentCalendar />;

      case "funnel":
        return <ConversionFunnelAnalytics />;

      case "currency":
        return <MultiCurrencySupport />;

      case "languages":
        return <MultiLanguageSupport />;


      case "team":
        return <TeamManager />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">V</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg">VibeLink</h2>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-2">
            <nav className="px-2 space-y-1">
              {navCategories.map((cat) => {
                const isExpanded = expandedCategories.includes(cat.category);
                const hasActiveItem = cat.items.some(item => item.id === activeSection);

                return (
                  <div key={cat.category} className="mb-1">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(cat.category)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all
                        ${hasActiveItem
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        <span>{cat.category}</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Category Items */}
                    {isExpanded && (
                      <div className="ml-2 mt-1 space-y-0.5 border-l-2 border-muted pl-2">
                        {cat.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id, cat.category)}
                            className={`
                              w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
                              ${activeSection === item.id
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              }
                            `}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="font-semibold">{navCategories.flatMap(c => c.items).find(i => i.id === activeSection)?.label}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event Title</p>
                  <p className="font-medium">{selectedOrder.event_title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium">{selectedOrder.event_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedOrder.package_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Price</p>
                  <p className="font-medium">₵{Number(selectedOrder.total_price).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* Payment Status Section */}
              <div>
                <h4 className="font-semibold mb-3">Payment Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Deposit Status */}
                  <div className={`p-4 rounded-lg border ${selectedOrder.deposit_paid ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedOrder.deposit_paid ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                      <span className="font-medium">50% Deposit</span>
                    </div>
                    <p className="text-lg font-bold">
                      ₵{(Number(selectedOrder.total_price) * 0.5).toLocaleString()}
                    </p>
                    {selectedOrder.deposit_paid ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {selectedOrder.deposit_paid_at 
                          ? format(new Date(selectedOrder.deposit_paid_at), "MMM d, yyyy 'at' h:mm a")
                          : "Unknown date"}
                        {selectedOrder.deposit_reference && (
                          <span className="block mt-0.5">Ref: {selectedOrder.deposit_reference}</span>
                        )}
                      </p>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-yellow-700 border-yellow-300 dark:text-yellow-400 dark:border-yellow-700">
                        Pending
                      </Badge>
                    )}
                  </div>

                  {/* Balance Status */}
                  <div className={`p-4 rounded-lg border ${selectedOrder.balance_paid ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-muted/50 border-border'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedOrder.balance_paid ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">50% Balance</span>
                    </div>
                    <p className="text-lg font-bold">
                      ₵{(Number(selectedOrder.total_price) * 0.5).toLocaleString()}
                    </p>
                    {selectedOrder.balance_paid ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Paid on {selectedOrder.balance_paid_at 
                          ? format(new Date(selectedOrder.balance_paid_at), "MMM d, yyyy 'at' h:mm a")
                          : "Unknown date"}
                        {selectedOrder.balance_reference && (
                          <span className="block mt-0.5">Ref: {selectedOrder.balance_reference}</span>
                        )}
                      </p>
                    ) : (
                      <Badge variant="outline" className="mt-2">
                        {selectedOrder.deposit_paid ? "Due on completion" : "Awaiting deposit"}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Manual Payment Recording */}
                {(!selectedOrder.deposit_paid || !selectedOrder.balance_paid) && (
                  <div className="bg-muted/30 rounded-lg p-4 mt-4">
                    <h5 className="text-sm font-medium mb-3">Record Manual Payment (Cash/Bank Transfer)</h5>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        placeholder="Reference (optional)"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="flex-1"
                      />
                      {!selectedOrder.deposit_paid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => recordManualPayment("deposit")}
                          disabled={recordingPayment !== null}
                          className="whitespace-nowrap"
                        >
                          {recordingPayment === "deposit" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          Record Deposit
                        </Button>
                      )}
                      {selectedOrder.deposit_paid && !selectedOrder.balance_paid && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => recordManualPayment("balance")}
                          disabled={recordingPayment !== null}
                          className="whitespace-nowrap"
                        >
                          {recordingPayment === "balance" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <CreditCard className="h-4 w-4 mr-2" />
                          )}
                          Record Balance
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Use this for payments made outside Paystack (MoMo, bank transfer, cash)
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Client Info */}
              <div>
                <h4 className="font-semibold mb-3">Client Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.client_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.client_phone}</span>
                  </div>
                  {selectedOrder.client_whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.client_whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Final Invitation Link */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Final Invitation Link
                </h4>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Enter the final invitation URL (subdomain or custom domain) to deliver to the customer.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      placeholder="e.g., amawedding.vibelinkevent.com"
                      value={finalLink}
                      onChange={(e) => setFinalLink(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={saveFinalLink}
                      disabled={savingFinalLink}
                      className="whitespace-nowrap"
                    >
                      {savingFinalLink ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Save Link
                    </Button>
                  </div>
                  {(selectedOrder as any).final_link && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Link Saved
                      </Badge>
                      <a
                        href={`https://${(selectedOrder as any).final_link.replace(/^https?:\/\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {(selectedOrder as any).final_link}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Revision Requests Section */}
              {revisionRequests.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Revision Requests ({revisionRequests.length})
                    </h4>
                    <div className="space-y-4">
                      {revisionRequests.map((revision) => (
                        <div
                          key={revision.id}
                          className={`p-4 rounded-lg border ${
                            revision.status === "pending"
                              ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"
                              : revision.status === "in_progress"
                              ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                              : "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(revision.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                revision.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                  : revision.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-green-100 text-green-800 border-green-300"
                              }
                            >
                              {revision.status === "pending"
                                ? "Pending"
                                : revision.status === "in_progress"
                                ? "In Progress"
                                : "Completed"}
                            </Badge>
                          </div>

                          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg mb-3">
                            <p className="text-sm font-medium mb-1">Customer Request:</p>
                            <p className="text-sm text-muted-foreground">{revision.request_text}</p>
                          </div>

                          {revision.admin_response && (
                            <div className="bg-primary/5 p-3 rounded-lg border-l-2 border-primary mb-3">
                              <p className="text-sm font-medium mb-1">Your Response:</p>
                              <p className="text-sm">{revision.admin_response}</p>
                            </div>
                          )}

                          {revision.status !== "completed" && (
                            <div className="space-y-3">
                              <Textarea
                                placeholder="Add your response or notes about the revision..."
                                value={respondingToRevision === revision.id ? adminResponse : ""}
                                onChange={(e) => {
                                  setRespondingToRevision(revision.id);
                                  setAdminResponse(e.target.value);
                                }}
                                onFocus={() => setRespondingToRevision(revision.id)}
                                rows={2}
                                className="text-sm"
                              />
                              <div className="flex gap-2">
                                {revision.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => respondToRevision(revision.id, "in_progress")}
                                    disabled={respondingToRevision === revision.id && !adminResponse}
                                  >
                                    {respondingToRevision === revision.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <Clock className="h-4 w-4 mr-2" />
                                    )}
                                    Start Working
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  onClick={() => respondToRevision(revision.id, "completed")}
                                  disabled={respondingToRevision === revision.id && !adminResponse}
                                >
                                  {respondingToRevision === revision.id ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Mark Complete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => sendPaymentReminder(selectedOrder)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Payment Reminder
                </Button>
                {selectedOrder.client_whatsapp && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/${selectedOrder.client_whatsapp}`, '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
              </div>

              {/* Payment History */}
              {paymentHistory.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Payment History</h4>
                    <div className="space-y-2">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {payment.payment_type} - ₵{Number(payment.amount).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(payment.created_at), "MMM d, yyyy h:mm a")}
                                {payment.reference && ` • Ref: ${payment.reference}`}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {payment.payment_method.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Reminder History */}
              {reminderLogs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Reminder History</h4>
                    <div className="space-y-2">
                      {reminderLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <p className="text-sm font-medium">{log.reminder_type}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(log.sent_at), "MMM d, yyyy h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Badge variant={log.success ? "default" : "destructive"}>
                            {log.success ? "Sent" : "Failed"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
