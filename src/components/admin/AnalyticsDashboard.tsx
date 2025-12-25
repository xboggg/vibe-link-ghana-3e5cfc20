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
import { Eye, Users, Clock, TrendingUp, Loader2, Globe, Radio } from "lucide-react";
import { useRealtimeVisitors } from "@/hooks/useRealtimeVisitors";

interface PageView {
  id: string;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  session_id: string | null;
  created_at: string;
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

  // Page distribution for pie chart
  const pieData = pageStats.slice(0, 5).map((ps) => ({
    name: ps.path === "/" ? "Home" : ps.path.replace("/", "").charAt(0).toUpperCase() + ps.path.slice(2),
    value: ps.views,
  }));

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgViewsPerSession}</div>
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
