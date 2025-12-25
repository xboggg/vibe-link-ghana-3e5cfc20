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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarView } from "@/components/admin/CalendarView";
import type { Database } from "@/integrations/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

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

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

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

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update order status");
    } else {
      toast.success("Order status updated");
      fetchOrders();
    }
  };

  const updatePaymentStatus = async (orderId: string, status: PaymentStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: status })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update payment status");
    } else {
      toast.success("Payment status updated");
      fetchOrders();
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage orders and track payments
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deposits Received
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">GHS {depositReceived.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle and Orders */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <CardTitle>Orders</CardTitle>
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
              {viewMode === "list" && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : viewMode === "calendar" ? (
              <CalendarView orders={orders} onSelectOrder={setSelectedOrder} />
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground">
                  Orders will appear here when clients submit the order form.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Package</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Order Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.client_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.client_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.event_title}</div>
                            <div className="text-sm text-muted-foreground capitalize">
                              {order.event_type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{order.package_name}</TableCell>
                        <TableCell className="font-medium">
                          GHS {Number(order.total_price).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.order_status}
                            onValueChange={(value) =>
                              updateOrderStatus(order.id, value as OrderStatus)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge
                                variant="secondary"
                                className={orderStatusColors[order.order_status]}
                              >
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
                            onValueChange={(value) =>
                              updatePaymentStatus(order.id, value as PaymentStatus)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge
                                variant="secondary"
                                className={paymentStatusColors[order.payment_status]}
                              >
                                {order.payment_status.replace("_", " ")}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="deposit_paid">50% Deposit</SelectItem>
                              <SelectItem value="fully_paid">Fully Paid</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
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
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedOrder.client_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${selectedOrder.client_phone}`} className="hover:underline">
                      {selectedOrder.client_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${selectedOrder.client_email}`} className="hover:underline">
                      {selectedOrder.client_email}
                    </a>
                  </div>
                  {selectedOrder.client_whatsapp && (
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`https://wa.me/${selectedOrder.client_whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {selectedOrder.client_whatsapp}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Event Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Event Type</span>
                    <p className="font-medium capitalize">{selectedOrder.event_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Event Title</span>
                    <p className="font-medium">{selectedOrder.event_title}</p>
                  </div>
                  {selectedOrder.event_date && (
                    <div>
                      <span className="text-sm text-muted-foreground">Date</span>
                      <p className="font-medium">
                        {format(new Date(selectedOrder.event_date), "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}
                  {selectedOrder.event_time && (
                    <div>
                      <span className="text-sm text-muted-foreground">Time</span>
                      <p className="font-medium">{selectedOrder.event_time}</p>
                    </div>
                  )}
                  {selectedOrder.venue_name && (
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">Venue</span>
                      <p className="font-medium">{selectedOrder.venue_name}</p>
                      {selectedOrder.venue_address && (
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.venue_address}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Design Preferences */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Design Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedOrder.color_palette && (
                    <div>
                      <span className="text-sm text-muted-foreground">Color Palette</span>
                      <p className="font-medium">{selectedOrder.color_palette}</p>
                    </div>
                  )}
                  {selectedOrder.style_preferences && selectedOrder.style_preferences.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Style</span>
                      <p className="font-medium">{selectedOrder.style_preferences.join(", ")}</p>
                    </div>
                  )}
                  {selectedOrder.custom_colors && selectedOrder.custom_colors.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">Custom Colors</span>
                      <div className="flex gap-2 mt-1">
                        {selectedOrder.custom_colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Package & Pricing */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Package & Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{selectedOrder.package_name}</span>
                    <span>GHS {Number(selectedOrder.package_price).toLocaleString()}</span>
                  </div>
                  {selectedOrder.add_ons && Array.isArray(selectedOrder.add_ons) && selectedOrder.add_ons.length > 0 && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <span className="text-sm text-muted-foreground">Add-ons:</span>
                        {(selectedOrder.add_ons as any[]).map((addon: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{addon.name}</span>
                            <span>GHS {addon.price}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>GHS {Number(selectedOrder.total_price).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedOrder.special_requests && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Special Requests</h3>
                  <p className="text-sm">{selectedOrder.special_requests}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
