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
} from "lucide-react";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { FollowUpHistory } from "@/components/admin/FollowUpHistory";
import { FollowUpSettings } from "@/components/admin/FollowUpSettings";
import { BlogManager } from "@/components/admin/BlogManager";
import { UserManagement } from "@/components/admin/UserManagement";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { NewsletterManager } from "@/components/admin/NewsletterManager";
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

type AdminSection = "dashboard" | "orders" | "analytics" | "blog" | "testimonials" | "newsletter" | "follow-ups" | "email-settings" | "users";

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

const navItems = [
  { id: "dashboard" as AdminSection, label: "Dashboard", icon: LayoutDashboard },
  { id: "orders" as AdminSection, label: "Orders", icon: Package },
  { id: "analytics" as AdminSection, label: "Analytics", icon: BarChart3 },
  { id: "blog" as AdminSection, label: "Blog", icon: FileText },
  { id: "testimonials" as AdminSection, label: "Testimonials", icon: Quote },
  { id: "newsletter" as AdminSection, label: "Newsletter", icon: Newspaper },
  { id: "follow-ups" as AdminSection, label: "Follow-ups", icon: Send },
  { id: "email-settings" as AdminSection, label: "Email Settings", icon: Mail },
  { id: "users" as AdminSection, label: "User Management", icon: Shield },
];

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
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
    } else {
      setReminderLogs([]);
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
    
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status })
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
  const thisMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at);
    const now = new Date();
    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  if (loading) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                      <DollarSign className="h-6 w-6 text-green-600" />
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
        return <AnalyticsDashboard />;

      case "blog":
        return <BlogManager />;

      case "testimonials":
        return <TestimonialsManager />;

      case "newsletter":
        return <NewsletterManager />;

      case "follow-ups":
        return <FollowUpHistory />;

      case "email-settings":
        return <FollowUpSettings />;

      case "users":
        return <UserManagement />;

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
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${activeSection === item.id 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </button>
              ))}
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
            <h1 className="font-semibold">{navItems.find(i => i.id === activeSection)?.label}</h1>
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
