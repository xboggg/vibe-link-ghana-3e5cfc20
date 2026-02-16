import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Download,
  Loader2, RefreshCw, FileText, DollarSign, Package, Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  format,
  startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
  startOfYear, endOfYear,
  subMonths, subWeeks,
  eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from "date-fns";

interface ReportData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
  avgOrderValue: number;
}

interface FinancialReport {
  id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  orders_count: number;
  report_data: any;
  generated_at: string;
}

type ReportPeriod = "weekly" | "monthly" | "yearly";

export function FinancialReports() {
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>("monthly");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [savedReports, setSavedReports] = useState<FinancialReport[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    profitMargin: 0,
  });

  useEffect(() => {
    generateReport();
    fetchSavedReports();
  }, [reportPeriod]);

  const fetchSavedReports = async () => {
    try {
      const { data } = await supabase
        .from("financial_reports")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(10);
      setSavedReports(data || []);
    } catch (err) {
      console.error("Error fetching saved reports:", err);
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      let periods: { start: Date; end: Date; label: string }[] = [];

      switch (reportPeriod) {
        case "weekly":
          for (let i = 11; i >= 0; i--) {
            const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
            const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
            periods.push({
              start: weekStart,
              end: weekEnd,
              label: format(weekStart, "MMM d")
            });
          }
          break;

        case "monthly":
          for (let i = 11; i >= 0; i--) {
            const monthStart = startOfMonth(subMonths(now, i));
            const monthEnd = endOfMonth(subMonths(now, i));
            periods.push({
              start: monthStart,
              end: monthEnd,
              label: format(monthStart, "MMM yyyy")
            });
          }
          break;

        case "yearly":
          for (let i = 4; i >= 0; i--) {
            const year = now.getFullYear() - i;
            periods.push({
              start: new Date(year, 0, 1),
              end: new Date(year, 11, 31),
              label: year.toString()
            });
          }
          break;
      }

      const results: ReportData[] = [];
      let totalRevenue = 0;
      let totalExpenses = 0;
      let totalOrders = 0;

      for (const period of periods) {
        const startStr = format(period.start, "yyyy-MM-dd");
        const endStr = format(period.end, "yyyy-MM-dd");

        const [ordersResult, expensesResult] = await Promise.all([
          supabase
            .from("orders")
            .select("total_price")
            .gte("created_at", startStr)
            .lte("created_at", endStr + "T23:59:59")
            .in("order_status", ["completed"]),
          supabase
            .from("expenses")
            .select("amount")
            .gte("expense_date", startStr)
            .lte("expense_date", endStr)
        ]);

        const revenue = (ordersResult.data || []).reduce((sum, o) => sum + (o.total_price || 0), 0);
        const expenses = (expensesResult.data || []).reduce((sum, e) => sum + (e.amount || 0), 0);
        const orders = ordersResult.data?.length || 0;

        results.push({
          period: period.label,
          revenue,
          expenses,
          profit: revenue - expenses,
          orders,
          avgOrderValue: orders > 0 ? revenue / orders : 0
        });

        totalRevenue += revenue;
        totalExpenses += expenses;
        totalOrders += orders;
      }

      setReportData(results);
      setSummary({
        totalRevenue,
        totalExpenses,
        totalProfit: totalRevenue - totalExpenses,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
      });
    } catch (err) {
      console.error("Error generating report:", err);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    setIsGenerating(true);
    try {
      const now = new Date();
      let periodStart: Date, periodEnd: Date;

      switch (reportPeriod) {
        case "weekly":
          periodStart = startOfWeek(subWeeks(now, 11), { weekStartsOn: 1 });
          periodEnd = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case "monthly":
          periodStart = startOfMonth(subMonths(now, 11));
          periodEnd = endOfMonth(now);
          break;
        case "yearly":
          periodStart = new Date(now.getFullYear() - 4, 0, 1);
          periodEnd = new Date(now.getFullYear(), 11, 31);
          break;
      }

      const { error } = await supabase.from("financial_reports").insert([{
        report_type: reportPeriod,
        period_start: format(periodStart, "yyyy-MM-dd"),
        period_end: format(periodEnd, "yyyy-MM-dd"),
        total_revenue: summary.totalRevenue,
        total_expenses: summary.totalExpenses,
        net_profit: summary.totalProfit,
        orders_count: summary.totalOrders,
        report_data: JSON.parse(JSON.stringify({ periods: reportData, summary }))
      }]);

      if (error) throw error;
      toast.success("Report saved successfully");
      fetchSavedReports();
    } catch (err) {
      console.error("Error saving report:", err);
      toast.error("Failed to save report");
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    const csvContent = [
      ["Period", "Revenue (GHS)", "Expenses (GHS)", "Profit (GHS)", "Orders", "Avg Order Value (GHS)"],
      ...reportData.map(r => [
        r.period,
        r.revenue.toFixed(2),
        r.expenses.toFixed(2),
        r.profit.toFixed(2),
        r.orders.toString(),
        r.avgOrderValue.toFixed(2)
      ]),
      [],
      ["Summary"],
      ["Total Revenue", summary.totalRevenue.toFixed(2)],
      ["Total Expenses", summary.totalExpenses.toFixed(2)],
      ["Net Profit", summary.totalProfit.toFixed(2)],
      ["Total Orders", summary.totalOrders.toString()],
      ["Profit Margin", summary.profitMargin.toFixed(1) + "%"]
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vibelink-financial-report-${reportPeriod}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Report exported");
  };

  const maxRevenue = Math.max(...reportData.map(r => r.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">Analyze revenue, expenses and profit</p>
        </div>
        <div className="flex gap-2">
          <Select value={reportPeriod} onValueChange={(v) => setReportPeriod(v as ReportPeriod)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={generateReport} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={saveReport} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Save Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">GHS {summary.totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">GHS {summary.totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              GHS {summary.totalProfit.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{summary.profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders & AOV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalOrders}</p>
            <p className="text-xs text-muted-foreground">
              Avg: GHS {summary.avgOrderValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Revenue vs Expenses ({reportPeriod})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {reportData.map((data, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{data.period}</span>
                    <span className="text-muted-foreground">
                      Profit: <span className={data.profit >= 0 ? "text-green-600" : "text-red-600"}>
                        GHS {data.profit.toLocaleString()}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-6">
                    <div
                      className="bg-green-500 rounded-l transition-all"
                      style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      title={`Revenue: GHS ${data.revenue.toLocaleString()}`}
                    />
                    <div
                      className="bg-red-400 rounded-r transition-all"
                      style={{ width: `${(data.expenses / maxRevenue) * 100}%` }}
                      title={`Expenses: GHS ${data.expenses.toLocaleString()}`}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-4 justify-center pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded" />
                  <span>Expenses</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Avg Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((data, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{data.period}</TableCell>
                  <TableCell className="text-right text-green-600">
                    GHS {data.revenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-red-600">
                    GHS {data.expenses.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right font-medium ${data.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    GHS {data.profit.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{data.orders}</TableCell>
                  <TableCell className="text-right">
                    GHS {data.avgOrderValue.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead>Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{report.report_type}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(report.period_start), "MMM d")} - {format(new Date(report.period_end), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      GHS {report.total_revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      GHS {report.total_expenses.toLocaleString()}
                    </TableCell>
                    <TableCell className={`text-right ${report.net_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                      GHS {report.net_profit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(report.generated_at), "MMM d, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default FinancialReports;

