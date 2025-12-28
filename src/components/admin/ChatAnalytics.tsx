import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MessageCircle,
  TrendingUp,
  Clock,
  Users,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ConversationSummary {
  id: string;
  session_id: string;
  started_at: string;
  message_count: number;
}

interface TopicData {
  topic: string;
  count: number;
  last_asked_at: string;
}

interface MessageData {
  id: string;
  role: string;
  content: string;
  created_at: string;
  suggestions: string[] | null;
}

const TOPIC_COLORS: Record<string, string> = {
  pricing: "#10b981",
  wedding: "#f59e0b",
  funeral: "#6b7280",
  naming_ceremony: "#8b5cf6",
  birthday: "#ec4899",
  church_event: "#3b82f6",
  corporate: "#14b8a6",
  consultation: "#f97316",
  order_tracking: "#06b6d4",
  general: "#94a3b8",
  how_it_works: "#84cc16",
  adinkra: "#a855f7",
  festivals: "#eab308",
};

export function ChatAnalytics() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<MessageData[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMessages: 0,
    avgMessagesPerConversation: 0,
    todayConversations: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch conversations
      const { data: convData, error: convError } = await supabase
        .from("chat_conversations")
        .select("id, session_id, started_at, message_count")
        .order("started_at", { ascending: false })
        .limit(100);

      if (convError) throw convError;
      setConversations(convData || []);

      // Fetch topics
      const { data: topicData, error: topicError } = await supabase
        .from("chat_analytics")
        .select("topic, count, last_asked_at")
        .order("count", { ascending: false })
        .limit(20);

      if (topicError) throw topicError;
      setTopics(topicData || []);

      // Calculate stats
      const totalConversations = convData?.length || 0;
      const totalMessages = convData?.reduce((sum, c) => sum + c.message_count, 0) || 0;
      const avgMessages = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
      
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayConversations = convData?.filter(c => 
        new Date(c.started_at) >= todayStart
      ).length || 0;

      setStats({
        totalConversations,
        totalMessages,
        avgMessagesPerConversation: avgMessages,
        todayConversations,
      });
    } catch (error) {
      console.error("Error fetching chat analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversationId: string) => {
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
      setConversationMessages([]);
      return;
    }

    setLoadingMessages(true);
    setSelectedConversation(conversationId);
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, role, content, created_at, suggestions")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setConversationMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data
  const topicChartData = topics.slice(0, 8).map(t => ({
    name: t.topic.replace("_", " "),
    count: t.count,
    fill: TOPIC_COLORS[t.topic] || "#94a3b8",
  }));

  // Daily conversations for last 7 days
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const count = conversations.filter(c => {
      const started = new Date(c.started_at);
      return started >= dayStart && started <= dayEnd;
    }).length;
    return {
      date: format(date, "EEE"),
      conversations: count,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chatbot Analytics</h2>
          <p className="text-muted-foreground">Track user conversations and common questions</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                <p className="text-3xl font-bold">{stats.totalConversations}</p>
              </div>
              <div className="p-3 rounded-xl bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                <p className="text-3xl font-bold">{stats.totalMessages}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Messages/Chat</p>
                <p className="text-3xl font-bold">{stats.avgMessagesPerConversation}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Chats</p>
                <p className="text-3xl font-bold">{stats.todayConversations}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="topics">Popular Topics</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Conversations Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Conversations (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="conversations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Topic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topicChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {topicChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Popular Topics</CardTitle>
              <CardDescription>Most frequently asked topics by customers</CardDescription>
            </CardHeader>
            <CardContent>
              {topics.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No topic data yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead>Last Asked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topics.map((topic) => (
                      <TableRow key={topic.topic}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            style={{ 
                              borderColor: TOPIC_COLORS[topic.topic],
                              color: TOPIC_COLORS[topic.topic] 
                            }}
                          >
                            {topic.topic.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{topic.count}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(topic.last_asked_at), "MMM d, yyyy h:mm a")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>View customer chat history</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <div key={conv.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => fetchConversationMessages(conv.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium">
                              {format(new Date(conv.started_at), "MMM d, yyyy h:mm a")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {conv.message_count} messages
                            </p>
                          </div>
                        </div>
                        {selectedConversation === conv.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      
                      {selectedConversation === conv.id && (
                        <div className="border-t bg-muted/30 p-4">
                          {loadingMessages ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                          ) : (
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-3">
                                {conversationMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                  >
                                    <div
                                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                                        msg.role === "user"
                                          ? "bg-primary text-primary-foreground"
                                          : "bg-background border"
                                      }`}
                                    >
                                      <p className="whitespace-pre-wrap">{msg.content}</p>
                                      <p className="text-[10px] opacity-70 mt-1">
                                        {format(new Date(msg.created_at), "h:mm a")}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
