import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Loader2,
  BarChart3,
  DollarSign,
  Users,
  Package,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const METRIC_OPTIONS: MetricOption[] = [
  { id: "total_orders", label: "Total Orders", description: "Count of all orders", icon: <BarChart3 className="h-4 w-4" />, category: "Orders" },
  { id: "total_revenue", label: "Total Revenue", description: "Sum of all order values", icon: <DollarSign className="h-4 w-4" />, category: "Revenue" },
  { id: "avg_order_value", label: "Average Order Value", description: "Mean order amount", icon: <TrendingUp className="h-4 w-4" />, category: "Revenue" },
  { id: "orders_by_status", label: "Orders by Status", description: "Breakdown by order status", icon: <Clock className="h-4 w-4" />, category: "Orders" },
  { id: "orders_by_payment", label: "Payment Status", description: "Breakdown by payment status", icon: <DollarSign className="h-4 w-4" />, category: "Payments" },
  { id: "top_customers", label: "Top Customers", description: "Highest spending customers", icon: <Users className="h-4 w-4" />, category: "Customers" },
  { id: "orders_by_event", label: "Orders by Event Type", description: "Breakdown by event category", icon: <Package className="h-4 w-4" />, category: "Events" },
  { id: "orders_by_package", label: "Package Performance", description: "Sales by package type", icon: <Package className="h-4 w-4" />, category: "Packages" },
  { id: "daily_revenue", label: "Daily Revenue Trend", description: "Revenue over time", icon: <TrendingUp className="h-4 w-4" />, category: "Trends" },
  { id: "peak_hours", label: "Peak Ordering Hours", description: "Busiest times of day", icon: <Clock className="h-4 w-4" />, category: "Trends" },
  { id: "peak_days", label: "Peak Ordering Days", description: "Busiest days of week", icon: <Clock className="h-4 w-4" />, category: "Trends" },
  { id: "completion_rate", label: "Completion Rate", description: "Order completion percentage", icon: <TrendingUp className="h-4 w-4" />, category: "Performance" },
];

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
}

export const ReportBuilder = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "total_orders", "total_revenue", "orders_by_status"
  ]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [generating, setGenerating] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null);

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    );
  };

  const generateReport = async () => {
    if (selectedMetrics.length === 0) {
      toast.error("Please select at least one metric");
      return;
    }

    if (!dateFrom || !dateTo) {
      toast.error("Please select date range");
      return;
    }

    setGenerating(true);
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startOfDay(dateFrom).toISOString())
        .lte("created_at", endOfDay(dateTo).toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reportData = generateMetrics(orders || [], selectedMetrics);
      setPreviewData(reportData);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const generateMetrics = (orders: Order[], metrics: string[]): Record<string, any> => {
    const result: Record<string, any> = {
      dateRange: {
        from: format(dateFrom!, "MMM d, yyyy"),
        to: format(dateTo!, "MMM d, yyyy")
      }
    };

    if (metrics.includes("total_orders")) {
      result.total_orders = orders.length;
    }

    if (metrics.includes("total_revenue")) {
      result.total_revenue = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
    }

    if (metrics.includes("avg_order_value")) {
      const total = orders.reduce((sum, o) => sum + Number(o.total_price), 0);
      result.avg_order_value = orders.length > 0 ? total / orders.length : 0;
    }

    if (metrics.includes("orders_by_status")) {
      result.orders_by_status = orders.reduce((acc: Record<string, number>, o) => {
        acc[o.order_status] = (acc[o.order_status] || 0) + 1;
        return acc;
      }, {});
    }

    if (metrics.includes("orders_by_payment")) {
      result.orders_by_payment = orders.reduce((acc: Record<string, number>, o) => {
        acc[o.payment_status] = (acc[o.payment_status] || 0) + 1;
        return acc;
      }, {});
    }

    if (metrics.includes("top_customers")) {
      const customerStats = orders.reduce((acc: Record<string, { name: string; orders: number; revenue: number }>, o) => {
        const key = o.client_email.toLowerCase();
        if (!acc[key]) acc[key] = { name: o.client_name, orders: 0, revenue: 0 };
        acc[key].orders += 1;
        acc[key].revenue += Number(o.total_price);
        return acc;
      }, {});
      result.top_customers = Object.entries(customerStats)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([email, stats]) => ({ email, ...stats }));
    }

    if (metrics.includes("orders_by_event")) {
      result.orders_by_event = orders.reduce((acc: Record<string, number>, o) => {
        acc[o.event_type] = (acc[o.event_type] || 0) + 1;
        return acc;
      }, {});
    }

    if (metrics.includes("orders_by_package")) {
      const packageStats = orders.reduce((acc: Record<string, { count: number; revenue: number }>, o) => {
        if (!acc[o.package_name]) acc[o.package_name] = { count: 0, revenue: 0 };
        acc[o.package_name].count += 1;
        acc[o.package_name].revenue += Number(o.total_price);
        return acc;
      }, {});
      result.orders_by_package = Object.entries(packageStats)
        .map(([name, stats]) => ({ name, ...stats }));
    }

    if (metrics.includes("completion_rate")) {
      const completed = orders.filter(o => o.order_status === "completed").length;
      result.completion_rate = orders.length > 0 ? (completed / orders.length) * 100 : 0;
    }

    return result;
  };

  const exportToCSV = () => {
    if (!previewData) return;

    const lines: string[] = [];
    lines.push(`Custom Report - ${previewData.dateRange.from} to ${previewData.dateRange.to}`);
    lines.push("");

    Object.entries(previewData).forEach(([key, value]) => {
      if (key === "dateRange") return;
      
      const metric = METRIC_OPTIONS.find(m => m.id === key);
      if (!metric) return;

      lines.push(metric.label);
      
      if (typeof value === "number") {
        lines.push(key.includes("revenue") || key.includes("value") 
          ? `GHS ${value.toLocaleString()}` 
          : key.includes("rate") ? `${value.toFixed(1)}%` : value.toString());
      } else if (Array.isArray(value)) {
        if (key === "top_customers") {
          lines.push("Name,Email,Orders,Revenue");
          value.forEach((c: any) => lines.push(`${c.name},${c.email},${c.orders},GHS ${c.revenue.toLocaleString()}`));
        } else {
          lines.push("Name,Count,Revenue");
          value.forEach((p: any) => lines.push(`${p.name},${p.count},GHS ${p.revenue.toLocaleString()}`));
        }
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([k, v]) => lines.push(`${k},${v}`));
      }
      lines.push("");
    });

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `custom-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported to CSV");
  };

  const exportToPDF = () => {
    if (!previewData) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Custom Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
          h2 { color: #555; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .metric { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px; }
          .metric-label { font-size: 14px; color: #666; }
          .metric-value { font-size: 24px; font-weight: bold; color: #D4AF37; }
          .generated { color: #888; font-size: 12px; margin-top: 40px; }
        </style>
      </head>
      <body>
        <h1>VibeLink Events - Custom Analytics Report</h1>
        <p><strong>Period:</strong> ${previewData.dateRange.from} to ${previewData.dateRange.to}</p>
        
        ${previewData.total_orders !== undefined ? `
          <div class="metric">
            <div class="metric-label">Total Orders</div>
            <div class="metric-value">${previewData.total_orders}</div>
          </div>
        ` : ""}
        
        ${previewData.total_revenue !== undefined ? `
          <div class="metric">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">₵${previewData.total_revenue.toLocaleString()}</div>
          </div>
        ` : ""}
        
        ${previewData.avg_order_value !== undefined ? `
          <div class="metric">
            <div class="metric-label">Average Order Value</div>
            <div class="metric-value">₵${previewData.avg_order_value.toFixed(0)}</div>
          </div>
        ` : ""}
        
        ${previewData.completion_rate !== undefined ? `
          <div class="metric">
            <div class="metric-label">Completion Rate</div>
            <div class="metric-value">${previewData.completion_rate.toFixed(1)}%</div>
          </div>
        ` : ""}

        ${previewData.orders_by_status ? `
          <h2>Orders by Status</h2>
          <table>
            <tr><th>Status</th><th>Count</th></tr>
            ${Object.entries(previewData.orders_by_status).map(([status, count]) => 
              `<tr><td>${status.replace(/_/g, " ")}</td><td>${count}</td></tr>`
            ).join("")}
          </table>
        ` : ""}

        ${previewData.orders_by_payment ? `
          <h2>Payment Status</h2>
          <table>
            <tr><th>Status</th><th>Count</th></tr>
            ${Object.entries(previewData.orders_by_payment).map(([status, count]) => 
              `<tr><td>${status.replace(/_/g, " ")}</td><td>${count}</td></tr>`
            ).join("")}
          </table>
        ` : ""}

        ${previewData.top_customers ? `
          <h2>Top Customers</h2>
          <table>
            <tr><th>#</th><th>Name</th><th>Email</th><th>Orders</th><th>Revenue</th></tr>
            ${previewData.top_customers.map((c: any, i: number) => 
              `<tr><td>${i + 1}</td><td>${c.name}</td><td>${c.email}</td><td>${c.orders}</td><td>₵${c.revenue.toLocaleString()}</td></tr>`
            ).join("")}
          </table>
        ` : ""}

        ${previewData.orders_by_package ? `
          <h2>Package Performance</h2>
          <table>
            <tr><th>Package</th><th>Orders</th><th>Revenue</th></tr>
            ${previewData.orders_by_package.map((p: any) => 
              `<tr><td>${p.name}</td><td>${p.count}</td><td>₵${p.revenue.toLocaleString()}</td></tr>`
            ).join("")}
          </table>
        ` : ""}

        <p class="generated">Report generated on ${format(new Date(), "MMMM d, yyyy")} at ${format(new Date(), "HH:mm")}</p>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      toast.success("PDF report opened for printing");
    }
  };

  const categories = [...new Set(METRIC_OPTIONS.map(m => m.category))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Custom Report Builder</h2>
        <p className="text-muted-foreground">Select metrics and date range to generate custom reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metrics Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Select Metrics</CardTitle>
            <CardDescription>Choose which metrics to include in your report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {METRIC_OPTIONS.filter(m => m.category === category).map(metric => (
                    <label
                      key={metric.id}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedMetrics.includes(metric.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={selectedMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {metric.icon}
                          <span className="font-medium text-sm">{metric.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Date Range & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Range</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={generateReport} 
                className="w-full gap-2"
                disabled={generating || selectedMetrics.length === 0}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                Generate Report
              </Button>

              {previewData && (
                <>
                  <Button 
                    onClick={exportToCSV} 
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button 
                    onClick={exportToPDF} 
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export PDF
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {previewData.dateRange.from} to {previewData.dateRange.to}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {previewData.total_orders !== undefined && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{previewData.total_orders}</p>
                </div>
              )}
              {previewData.total_revenue !== undefined && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₵{previewData.total_revenue.toLocaleString()}</p>
                </div>
              )}
              {previewData.avg_order_value !== undefined && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold">₵{previewData.avg_order_value.toFixed(0)}</p>
                </div>
              )}
              {previewData.completion_rate !== undefined && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{previewData.completion_rate.toFixed(1)}%</p>
                </div>
              )}
            </div>

            {previewData.orders_by_status && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Orders by Status</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(previewData.orders_by_status).map(([status, count]) => (
                    <div key={status} className="px-3 py-2 bg-muted/50 rounded-lg">
                      <span className="text-sm capitalize">{status.replace(/_/g, " ")}: </span>
                      <span className="font-bold">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewData.top_customers && previewData.top_customers.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Top Customers</h4>
                <div className="space-y-2">
                  {previewData.top_customers.slice(0, 5).map((c: any, i: number) => (
                    <div key={c.email} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.orders} orders</p>
                        </div>
                      </div>
                      <span className="font-medium">₵{c.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};