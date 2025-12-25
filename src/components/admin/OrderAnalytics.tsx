import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Package, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  event_type: string;
  package_name: string;
  total_price: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  event_date: string | null;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const STATUS_COLORS: Record<string, string> = {
  pending: "hsl(var(--chart-4))",
  in_progress: "hsl(var(--primary))",
  draft_ready: "hsl(var(--chart-2))",
  revision: "hsl(var(--chart-3))",
  completed: "hsl(142, 76%, 36%)",
  cancelled: "hsl(0, 84%, 60%)",
};

export const OrderAnalytics = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    fetchOrders();
  }, [dateRange]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (dateRange !== "all") {
      const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      query = query.gte("created_at", startDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
  const completedOrders = orders.filter(o => o.order_status === "completed").length;
  const pendingOrders = orders.filter(o => o.order_status === "pending").length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Payment stats
  const fullyPaidOrders = orders.filter(o => o.payment_status === "fully_paid").length;
  const depositPaidOrders = orders.filter(o => o.payment_status === "deposit_paid").length;
  const pendingPaymentOrders = orders.filter(o => o.payment_status === "pending").length;

  // Revenue by day
  const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    
    const dayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });

    const dayRevenue = dayOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

    revenueByDay.push({
      date: format(date, days > 30 ? "MMM d" : "MMM d"),
      revenue: dayRevenue,
      orders: dayOrders.length,
    });
  }

  // Top customers
  const customerStats = orders.reduce((acc: Record<string, { name: string; email: string; orders: number; revenue: number }>, order) => {
    const key = order.client_email.toLowerCase();
    if (!acc[key]) {
      acc[key] = { name: order.client_name, email: order.client_email, orders: 0, revenue: 0 };
    }
    acc[key].orders += 1;
    acc[key].revenue += Number(order.total_price);
    return acc;
  }, {});

  const topCustomers = Object.values(customerStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Orders by event type
  const eventTypeStats = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.event_type] = (acc[order.event_type] || 0) + 1;
    return acc;
  }, {});

  const eventTypePieData = Object.entries(eventTypeStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Orders by status
  const statusStats = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.order_status] = (acc[order.order_status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusStats).map(([status, count]) => ({
    status: status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    count,
    fill: STATUS_COLORS[status] || COLORS[0],
  }));

  // Orders by package
  const packageStats = orders.reduce((acc: Record<string, { count: number; revenue: number }>, order) => {
    if (!acc[order.package_name]) {
      acc[order.package_name] = { count: 0, revenue: 0 };
    }
    acc[order.package_name].count += 1;
    acc[order.package_name].revenue += Number(order.total_price);
    return acc;
  }, {});

  const packageData = Object.entries(packageStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.revenue - a.revenue);

  // Peak ordering times (by hour)
  const hourlyStats = orders.reduce((acc: Record<number, number>, order) => {
    const hour = new Date(order.created_at).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    orders: hourlyStats[hour] || 0,
  }));

  // Peak ordering days (by day of week)
  const dayOfWeekStats = orders.reduce((acc: Record<number, number>, order) => {
    const day = new Date(order.created_at).getDay();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekData = dayNames.map((name, index) => ({
    day: name.substring(0, 3),
    orders: dayOfWeekStats[index] || 0,
  }));

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Order ID', 'Client Name', 'Email', 'Event Type', 'Package', 'Total Price', 'Order Status', 'Payment Status', 'Created At', 'Event Date'];
    const rows = orders.map(o => [
      o.id,
      o.client_name,
      o.client_email,
      o.event_type,
      o.package_name,
      o.total_price,
      o.order_status,
      o.payment_status,
      format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
      o.event_date ? format(new Date(o.event_date), 'yyyy-MM-dd') : 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Order data exported to CSV");
  };

  // Export summary to CSV
  const exportSummaryToCSV = () => {
    const summaryData = [
      ['Order Analytics Summary Report'],
      ['Generated on', format(new Date(), 'MMMM d, yyyy HH:mm')],
      ['Date Range', dateRange === 'all' ? 'All Time' : `Last ${dateRange.replace('d', ' Days')}`],
      [''],
      ['KEY METRICS'],
      ['Total Orders', totalOrders],
      ['Total Revenue', `GHS ${totalRevenue.toLocaleString()}`],
      ['Average Order Value', `GHS ${avgOrderValue.toFixed(2)}`],
      ['Completed Orders', completedOrders],
      ['Pending Orders', pendingOrders],
      ['Completion Rate', `${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%`],
      [''],
      ['PAYMENT STATUS'],
      ['Fully Paid', fullyPaidOrders],
      ['Deposit Paid', depositPaidOrders],
      ['Pending Payment', pendingPaymentOrders],
      [''],
      ['TOP CUSTOMERS'],
      ['Name', 'Email', 'Orders', 'Revenue'],
      ...topCustomers.map(c => [c.name, c.email, c.orders, `GHS ${c.revenue.toLocaleString()}`]),
      [''],
      ['ORDERS BY EVENT TYPE'],
      ['Event Type', 'Count'],
      ...eventTypePieData.map(e => [e.name, e.value]),
      [''],
      ['PACKAGE PERFORMANCE'],
      ['Package', 'Orders', 'Revenue'],
      ...packageData.map(p => [p.name, p.count, `GHS ${p.revenue.toLocaleString()}`]),
    ];
    
    const csvContent = summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-analytics-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Summary report exported to CSV");
  };

  // Export to PDF (using HTML print)
  const exportToPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .metric-box { display: inline-block; width: 22%; margin: 1%; padding: 15px; background: #f9f9f9; border-radius: 8px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #D4AF37; }
          .metric-label { font-size: 12px; color: #666; }
          .generated { color: #888; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>VibeLink Ghana - Order Analytics Report</h1>
        <p><strong>Date Range:</strong> ${dateRange === 'all' ? 'All Time' : `Last ${dateRange.replace('d', ' Days')}`}</p>
        
        <h2>Key Metrics</h2>
        <div style="margin: 20px 0;">
          <div class="metric-box">
            <div class="metric-value">${totalOrders}</div>
            <div class="metric-label">Total Orders</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">₵${totalRevenue.toLocaleString()}</div>
            <div class="metric-label">Total Revenue</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">₵${avgOrderValue.toFixed(0)}</div>
            <div class="metric-label">Avg Order Value</div>
          </div>
          <div class="metric-box">
            <div class="metric-value">${totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%</div>
            <div class="metric-label">Completion Rate</div>
          </div>
        </div>

        <h2>Payment Status</h2>
        <table>
          <tr><th>Status</th><th>Count</th></tr>
          <tr><td>Fully Paid</td><td>${fullyPaidOrders}</td></tr>
          <tr><td>Deposit Paid</td><td>${depositPaidOrders}</td></tr>
          <tr><td>Pending</td><td>${pendingPaymentOrders}</td></tr>
        </table>

        <h2>Top Customers</h2>
        <table>
          <tr><th>#</th><th>Name</th><th>Email</th><th>Orders</th><th>Revenue</th></tr>
          ${topCustomers.map((c, i) => `<tr><td>${i + 1}</td><td>${c.name}</td><td>${c.email}</td><td>${c.orders}</td><td>₵${c.revenue.toLocaleString()}</td></tr>`).join('')}
        </table>

        <h2>Orders by Event Type</h2>
        <table>
          <tr><th>Event Type</th><th>Count</th></tr>
          ${eventTypePieData.map(e => `<tr><td>${e.name}</td><td>${e.value}</td></tr>`).join('')}
        </table>

        <h2>Package Performance</h2>
        <table>
          <tr><th>#</th><th>Package</th><th>Orders</th><th>Revenue</th></tr>
          ${packageData.map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.count}</td><td>₵${p.revenue.toLocaleString()}</td></tr>`).join('')}
        </table>

        <p class="generated">Report generated on ${format(new Date(), 'MMMM d, yyyy')} at ${format(new Date(), 'HH:mm')}</p>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      toast.success("PDF report opened for printing");
    } else {
      toast.error("Please allow popups to export PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
          <TabsList>
            <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={exportToCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export All Orders (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportSummaryToCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export Summary (CSV)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={exportToPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export Report (PDF)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedOrders} completed, {pendingOrders} pending
            </p>
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
            <div className="text-2xl font-bold">
              ₵{totalRevenue.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg: ₵{avgOrderValue.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fullyPaidOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {depositPaidOrders} deposits, {pendingPaymentOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedOrders} of {totalOrders} orders completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Orders Over Time</CardTitle>
          <CardDescription>Daily revenue and order count trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  interval={days > 30 ? Math.floor(days / 10) : 0}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `₵${value.toLocaleString()}` : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Orders by Event Type */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {eventTypePieData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {eventTypePieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Peak Ordering Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Peak Ordering Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCustomers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                topCustomers.map((customer, index) => (
                  <div key={customer.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {customer.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {customer.orders} order{customer.orders !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      ₵{customer.revenue.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Package Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Package Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {packageData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No orders yet</p>
              ) : (
                packageData.map((pkg, index) => (
                  <div key={pkg.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {pkg.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {pkg.count} order{pkg.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      ₵{pkg.revenue.toLocaleString()}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
