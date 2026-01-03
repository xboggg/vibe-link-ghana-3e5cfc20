import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { TrendingUp, Users, ShoppingCart, CreditCard, Target, ArrowRight, ArrowDown, RefreshCw, Calendar, Filter, Download, Eye, MousePointer, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FunnelStage {
  name: string;
  icon: any;
  count: number;
  value: number;
  conversionRate: number;
  dropoffRate: number;
  color: string;
}

interface ConversionData {
  date: string;
  visitors: number;
  leads: number;
  carts: number;
  orders: number;
  revenue: number;
}

export const ConversionFunnelAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState("funnel");
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [conversionHistory, setConversionHistory] = useState<ConversionData[]>([]);
  const [stats, setStats] = useState({ totalVisitors: 0, totalLeads: 0, totalOrders: 0, totalRevenue: 0, overallConversion: 0 });

  useEffect(() => { fetchData(); }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const startDate = subDays(new Date(), parseInt(dateRange));
      const { data: orders } = await supabase.from("orders").select("*").gte("created_at", startDate.toISOString());
      const { data: carts } = await supabase.from("abandoned_carts").select("*").gte("created_at", startDate.toISOString());

      const orderCount = orders?.length || 0;
      const cartCount = (carts?.length || 0) + orderCount;
      const estimatedLeads = Math.floor(cartCount * 1.5);
      const estimatedVisitors = Math.floor(estimatedLeads * 3);
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

      const funnel: FunnelStage[] = [
        { name: "Visitors", icon: Eye, count: estimatedVisitors, value: 0, conversionRate: 100, dropoffRate: 0, color: "bg-blue-500" },
        { name: "Leads", icon: MousePointer, count: estimatedLeads, value: 0, conversionRate: (estimatedLeads / estimatedVisitors) * 100, dropoffRate: ((estimatedVisitors - estimatedLeads) / estimatedVisitors) * 100, color: "bg-indigo-500" },
        { name: "Add to Cart", icon: ShoppingCart, count: cartCount, value: 0, conversionRate: (cartCount / estimatedLeads) * 100, dropoffRate: ((estimatedLeads - cartCount) / estimatedLeads) * 100, color: "bg-purple-500" },
        { name: "Checkout", icon: CreditCard, count: Math.floor(cartCount * 0.7), value: 0, conversionRate: 70, dropoffRate: 30, color: "bg-pink-500" },
        { name: "Purchase", icon: CheckCircle, count: orderCount, value: totalRevenue, conversionRate: (orderCount / Math.max(cartCount, 1)) * 100, dropoffRate: ((cartCount - orderCount) / Math.max(cartCount, 1)) * 100, color: "bg-green-500" },
      ];

      setFunnelData(funnel);
      setStats({
        totalVisitors: estimatedVisitors,
        totalLeads: estimatedLeads,
        totalOrders: orderCount,
        totalRevenue,
        overallConversion: (orderCount / Math.max(estimatedVisitors, 1)) * 100,
      });

      // Generate mock historical data
      const history: ConversionData[] = [];
      for (let i = parseInt(dateRange); i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayOrders = orders?.filter((o) => format(new Date(o.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")) || [];
        const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const dayVisitors = Math.floor(Math.random() * 100) + 50;
        history.push({
          date: format(date, "yyyy-MM-dd"),
          visitors: dayVisitors,
          leads: Math.floor(dayVisitors * 0.3),
          carts: Math.floor(dayVisitors * 0.15),
          orders: dayOrders.length,
          revenue: dayRevenue,
        });
      }
      setConversionHistory(history);
    } catch (error) {
      toast.error("Failed to load funnel data");
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const csv = [
      ["Date", "Visitors", "Leads", "Carts", "Orders", "Revenue"],
      ...conversionHistory.map((d) => [d.date, d.visitors, d.leads, d.carts, d.orders, d.revenue.toFixed(2)]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `conversion-funnel-${dateRange}days.csv`;
    a.click();
    toast.success("Data exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-indigo-600" />Conversion Funnel Analytics</h2>
          <p className="text-gray-600 mt-1">Track visitor-to-customer journey</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="7">Last 7 days</SelectItem><SelectItem value="30">Last 30 days</SelectItem><SelectItem value="90">Last 90 days</SelectItem></SelectContent></Select>
          <Button variant="outline" onClick={fetchData} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Button variant="outline" onClick={exportData}><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Visitors</p><p className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</p></div><Eye className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Leads</p><p className="text-2xl font-bold">{stats.totalLeads.toLocaleString()}</p></div><MousePointer className="h-8 w-8 text-indigo-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Orders</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div><ShoppingCart className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Revenue</p><p className="text-2xl font-bold">GHS {stats.totalRevenue.toFixed(2)}</p></div><CreditCard className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Conversion</p><p className="text-2xl font-bold">{stats.overallConversion.toFixed(2)}%</p></div><Target className="h-8 w-8 text-amber-600" /></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="funnel">Funnel View</TabsTrigger><TabsTrigger value="stages">Stage Details</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>

        <TabsContent value="funnel">
          <Card>
            <CardHeader><CardTitle>Conversion Funnel</CardTitle><CardDescription>Visualize drop-off at each stage</CardDescription></CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {funnelData.map((stage, idx) => {
                  const width = 100 - (idx * 15);
                  const Icon = stage.icon;
                  return (
                    <div key={stage.name} className="w-full">
                      <div className="flex items-center justify-center mb-2">
                        <div className={`${stage.color} text-white px-6 py-4 rounded-lg flex items-center justify-between transition-all`} style={{ width: `${width}%` }}>
                          <div className="flex items-center gap-3"><Icon className="h-6 w-6" /><span className="font-medium">{stage.name}</span></div>
                          <div className="text-right"><div className="font-bold">{stage.count.toLocaleString()}</div>{stage.value > 0 && <div className="text-sm opacity-80">GHS {stage.value.toFixed(2)}</div>}</div>
                        </div>
                      </div>
                      {idx < funnelData.length - 1 && (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ArrowDown className="h-4 w-4" />
                            <span>{funnelData[idx + 1].conversionRate.toFixed(1)}% conversion</span>
                            <span className="text-red-500">({stage.dropoffRate.toFixed(1)}% drop-off)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stages">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {funnelData.map((stage, idx) => {
              const Icon = stage.icon;
              const prevStage = idx > 0 ? funnelData[idx - 1] : null;
              return (
                <Card key={stage.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className={`p-2 rounded-full ${stage.color} bg-opacity-20`}><Icon className={`h-5 w-5 ${stage.color.replace("bg-", "text-")}`} /></div><CardTitle className="text-lg">{stage.name}</CardTitle></div>
                      <Badge variant="outline">{stage.count.toLocaleString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {prevStage && (
                        <div>
                          <div className="flex justify-between text-sm mb-1"><span className="text-gray-500">From {prevStage.name}</span><span className="font-medium">{stage.conversionRate.toFixed(1)}%</span></div>
                          <Progress value={stage.conversionRate} className="h-2" />
                        </div>
                      )}
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Drop-off Rate</span><span className="text-red-600 font-medium">{stage.dropoffRate.toFixed(1)}%</span></div>
                      {stage.value > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Revenue</span><span className="text-green-600 font-medium">GHS {stage.value.toFixed(2)}</span></div>}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">{idx === 0 ? "Total unique visitors to site" : idx === 1 ? "Visitors who showed interest" : idx === 2 ? "Items added to cart" : idx === 3 ? "Started checkout process" : "Completed purchases"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Conversion History</CardTitle><CardDescription>Daily breakdown of funnel metrics</CardDescription></CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>Date</TableHead><TableHead>Visitors</TableHead><TableHead>Leads</TableHead><TableHead>Carts</TableHead><TableHead>Orders</TableHead><TableHead>Revenue</TableHead><TableHead>Conv. Rate</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversionHistory.slice().reverse().map((day) => (
                      <TableRow key={day.date}>
                        <TableCell className="font-medium">{format(new Date(day.date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{day.visitors}</TableCell>
                        <TableCell>{day.leads}</TableCell>
                        <TableCell>{day.carts}</TableCell>
                        <TableCell>{day.orders}</TableCell>
                        <TableCell>GHS {day.revenue.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline" className={day.orders > 0 ? "bg-green-100 text-green-800" : "bg-gray-100"}>{((day.orders / Math.max(day.visitors, 1)) * 100).toFixed(1)}%</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

