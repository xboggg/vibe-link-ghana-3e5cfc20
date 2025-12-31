import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Users, Clock, TrendingUp, Loader2, Globe, Radio, Monitor, Smartphone, Tablet } from "lucide-react";
import { useRealtimeVisitors } from "@/hooks/useRealtimeVisitors";

interface PageView {
  id: string;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  time_spent?: number | null;
}

interface DailyStats {
  date: string;
  views: number;
  sessions: number;
}

interface PageStats {
  path: string;
  views: number;
}

interface ReferrerStats {
  source: string;
  count: number;
}

interface DeviceStats {
  name: string;
  value: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

// Parse referrer to get source name
const parseReferrer = (referrer: string | null): string => {
  if (!referrer || referrer === "") return "Direct";
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.replace("www.", "");

    // Map common referrers to friendly names
    if (hostname.includes("google")) return "Google";
    if (hostname.includes("facebook") || hostname.includes("fb.")) return "Facebook";
    if (hostname.includes("twitter") || hostname.includes("t.co")) return "Twitter/X";
    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("linkedin")) return "LinkedIn";
    if (hostname.includes("tiktok")) return "TikTok";
    if (hostname.includes("youtube")) return "YouTube";
    if (hostname.includes("whatsapp")) return "WhatsApp";
    if (hostname.includes("pinterest")) return "Pinterest";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("bing")) return "Bing";
    if (hostname.includes("yahoo")) return "Yahoo";

    return hostname;
  } catch {
    return "Other";
  }
};

export const AnalyticsDashboard = () => {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("7d");
  const { activeVisitors, visitorsByPage } = useRealtimeVisitors();

  useEffect(() => {
    fetchPageViews();
  }, [dateRange]);

  const fetchPageViews = async () => {
    setLoading(true);
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const startDate = startOfDay(subDays(new Date(), days)).toISOString();

    const { data, error } = await supabase
      .from("page_views")
      .select("*")
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching page views:", error);
    } else {
      setPageViews(data || []);
    }
    setLoading(false);
  };

  // Calculate statistics
  const totalViews = pageViews.length;
  const uniqueSessions = new Set(pageViews.map((pv) => pv.session_id)).size;
  const avgViewsPerSession = uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : "0";

  // Calculate average time spent (only from views that have time_spent data)
  const viewsWithTime = pageViews.filter(pv => pv.time_spent && pv.time_spent > 0);
  const avgTimeSpent = viewsWithTime.length > 0
    ? Math.round(viewsWithTime.reduce((sum, pv) => sum + (pv.time_spent || 0), 0) / viewsWithTime.length)
    : 0;
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Daily stats for chart
  const dailyStats: DailyStats[] = [];
  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const dayViews = pageViews.filter((pv) => {
      const pvDate = new Date(pv.created_at);
      return pvDate >= dayStart && pvDate <= dayEnd;
    });

    const daySessions = new Set(dayViews.map((pv) => pv.session_id)).size;

    dailyStats.push({
      date: format(date, "MMM d"),
      views: dayViews.length,
      sessions: daySessions,
    });
  }

  // Top pages
  const pageStats: PageStats[] = Object.entries(
    pageViews.reduce((acc: Record<string, number>, pv) => {
      const path = pv.page_path;
      acc[path] = (acc[path] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Referrer stats
  const referrerStats: ReferrerStats[] = Object.entries(
    pageViews.reduce((acc: Record<string, number>, pv) => {
      const source = parseReferrer(pv.referrer);
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Device stats
  const deviceStats: DeviceStats[] = Object.entries(
    pageViews.reduce((acc: Record<string, number>, pv) => {
      const device = pv.device_type || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    .sort((a, b) => b.value - a.value);

  // Browser stats
  const browserStats: DeviceStats[] = Object.entries(
    pageViews.reduce((acc: Record<string, number>, pv) => {
      const browser = pv.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // OS stats
  const osStats: DeviceStats[] = Object.entries(
    pageViews.reduce((acc: Record<string, number>, pv) => {
      const os = pv.os || "Unknown";
      acc[os] = (acc[os] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Page distribution for pie chart
  const pieData = pageStats.slice(0, 5).map((ps) => ({
    name: ps.path === "/" ? "Home" : ps.path.replace("/", "").charAt(0).toUpperCase() + ps.path.slice(2),
    value: ps.views,
  }));

  // Device icon helper
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile": return <Smartphone className="h-4 w-4" />;
      case "tablet": return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
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
      {/* Date Range Tabs */}
      <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as "7d" | "30d" | "90d")}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Real-time Visitors */}
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-accent">
              Live Visitors
            </CardTitle>
            <Radio className="h-4 w-4 text-accent animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{activeVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">Real-time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Page Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueSessions.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Pages/Visit
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgViewsPerSession}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time on Page
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(avgTimeSpent)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Views
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyStats[dailyStats.length - 1]?.views || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Views Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Page Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Unique Visitors Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Unique Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device & Browser Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Device Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats.length === 0 || (deviceStats.length === 1 && deviceStats[0].name === "Unknown") ? (
                <p className="text-muted-foreground text-center py-4">No device data yet</p>
              ) : (
                deviceStats.filter(d => d.name !== "Unknown").map((device, index) => (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.name)}
                      <span className="text-sm font-medium">{device.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(20, (device.value / deviceStats[0].value) * 80)}px`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.round((device.value / totalViews) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {browserStats.length === 0 || (browserStats.length === 1 && browserStats[0].name === "Unknown") ? (
                <p className="text-muted-foreground text-center py-4">No browser data yet</p>
              ) : (
                browserStats.filter(b => b.name !== "Unknown").map((browser, index) => (
                  <div key={browser.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[120px]">{browser.name}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(20, (browser.value / browserStats[0].value) * 80)}px`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.round((browser.value / totalViews) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operating Systems */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {osStats.length === 0 || (osStats.length === 1 && osStats[0].name === "Unknown") ? (
                <p className="text-muted-foreground text-center py-4">No OS data yet</p>
              ) : (
                osStats.filter(o => o.name !== "Unknown").map((os, index) => (
                  <div key={os.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[120px]">{os.name}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(20, (os.value / osStats[0].value) * 80)}px`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {Math.round((os.value / totalViews) * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pageStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No page views yet</p>
              ) : (
                pageStats.slice(0, 6).map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {page.path === "/" ? "Home" : page.path}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-primary rounded-full"
                        style={{
                          width: `${Math.max(20, (page.views / pageStats[0].views) * 80)}px`
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {page.views}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {referrerStats.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No referrer data yet</p>
              ) : (
                referrerStats.map((ref, index) => (
                  <div key={ref.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        {index + 1}.
                      </span>
                      <span className="text-sm font-medium truncate max-w-[120px]">
                        {ref.source}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max(20, (ref.count / referrerStats[0].count) * 80)}px`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                      <span className="text-sm text-muted-foreground w-10 text-right">
                        {ref.count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Page Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {pieData.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
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
    </div>
  );
};

