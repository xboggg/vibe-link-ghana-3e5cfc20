import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Users, Clock, Tag, TrendingUp } from "lucide-react";

const FREQUENCY_LABELS: Record<string, string> = {
  all: "All Emails",
  weekly: "Weekly Digest",
  monthly: "Monthly Digest",
};

const TOPIC_LABELS: Record<string, { label: string; color: string }> = {
  announcements: { label: "Announcements", color: "#7C3AED" },
  promotions: { label: "Promotions", color: "#F59E0B" },
  events: { label: "Event Tips", color: "#22C55E" },
  showcase: { label: "Work Showcase", color: "#3B82F6" },
};

const FREQUENCY_COLORS = ["#7C3AED", "#F59E0B", "#22C55E"];

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  frequency: string;
  topics: string[];
}

export function SubscriberPreferences() {
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["subscriber-preferences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("id, email, is_active, frequency, topics");
      
      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const activeSubscribers = subscribers.filter(s => s.is_active);
  const totalActive = activeSubscribers.length;

  // Calculate frequency distribution
  const frequencyStats = activeSubscribers.reduce((acc, sub) => {
    const freq = sub.frequency || "all";
    acc[freq] = (acc[freq] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const frequencyData = Object.entries(frequencyStats).map(([key, value]) => ({
    name: FREQUENCY_LABELS[key] || key,
    value,
    percentage: totalActive > 0 ? Math.round((value / totalActive) * 100) : 0,
  }));

  // Calculate topic interest
  const topicStats = activeSubscribers.reduce((acc, sub) => {
    const topics = sub.topics || [];
    // If no topics selected, count as interested in all
    if (topics.length === 0) {
      Object.keys(TOPIC_LABELS).forEach(topic => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
    } else {
      topics.forEach(topic => {
        acc[topic] = (acc[topic] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topicData = Object.entries(TOPIC_LABELS).map(([key, { label, color }]) => ({
    key,
    label,
    color,
    count: topicStats[key] || 0,
    percentage: totalActive > 0 ? Math.round(((topicStats[key] || 0) / totalActive) * 100) : 0,
  }));

  // Calculate engagement metrics
  const subscribersWithPreferences = activeSubscribers.filter(
    s => (s.topics && s.topics.length > 0) || s.frequency !== "all"
  ).length;
  const customizationRate = totalActive > 0 
    ? Math.round((subscribersWithPreferences / totalActive) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Subscriber Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Understand how your subscribers want to receive content
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Subscribers
            </CardDescription>
            <CardTitle className="text-2xl">{totalActive}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Customization Rate
            </CardDescription>
            <CardTitle className="text-2xl">{customizationRate}%</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {subscribersWithPreferences} have set preferences
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Most Popular Frequency
            </CardDescription>
            <CardTitle className="text-2xl">
              {frequencyData.length > 0 
                ? frequencyData.sort((a, b) => b.value - a.value)[0].name 
                : "All Emails"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Top Topic Interest
            </CardDescription>
            <CardTitle className="text-2xl">
              {topicData.length > 0 
                ? topicData.sort((a, b) => b.count - a.count)[0].label 
                : "N/A"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Frequency Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Frequency Preferences</CardTitle>
            <CardDescription>How often subscribers want to hear from you</CardDescription>
          </CardHeader>
          <CardContent>
            {frequencyData.length > 0 ? (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={frequencyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {frequencyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={FREQUENCY_COLORS[index % FREQUENCY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value} subscribers`, name]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Topic Interest */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic Interest</CardTitle>
            <CardDescription>What content subscribers want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topicData.map((topic) => (
              <div key={topic.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: topic.color }}
                    />
                    <span className="text-sm font-medium">{topic.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {topic.count}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {topic.percentage}%
                    </span>
                  </div>
                </div>
                <Progress value={topic.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Targeting Tips */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Targeting Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• When composing newsletters, select a topic to target subscribers interested in that content.</p>
          <p>• Subscribers who haven't set preferences will receive all newsletters.</p>
          <p>• Higher customization rates lead to better engagement and lower unsubscribe rates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
