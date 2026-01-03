import { useState, useEffect } from "react";
import {
  Star, Send, MessageSquare, Clock, CheckCircle, Users,
  Loader2, ThumbsUp, ThumbsDown, AlertTriangle, Eye, Trash2,
  Mail, Phone, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow, addDays } from "date-fns";

interface Survey {
  id: string;
  order_id: string | null;
  customer_email: string;
  customer_name: string;
  token: string;
  status: string;
  sent_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  created_at: string;
  survey_responses?: SurveyResponse[];
}

interface SurveyResponse {
  id: string;
  survey_id: string;
  overall_rating: number;
  design_quality: number | null;
  communication: number | null;
  delivery_speed: number | null;
  value_for_money: number | null;
  feedback_text: string | null;
  allow_testimonial: boolean;
  created_at: string;
}

interface Order {
  id: string;
  order_number: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  status: string;
}

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-gray-500", icon: <Clock className="h-3 w-3" /> },
  sent: { color: "bg-blue-500", icon: <Send className="h-3 w-3" /> },
  completed: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
  expired: { color: "bg-red-500", icon: <AlertTriangle className="h-3 w-3" /> },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const stars = [];
  const sizeClass = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`${sizeClass} ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    );
  }
  return <div className="flex gap-0.5">{stars}</div>;
}

export function CustomerSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    order_id: "",
    customer_name: "",
    customer_email: "",
  });

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    avgRating: 0,
    responseRate: 0,
    nps: 0,
  });

  useEffect(() => {
    fetchSurveys();
    fetchOrders();
  }, []);

  const fetchSurveys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("surveys")
        .select("*, survey_responses(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSurveys(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching surveys:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, client_name, client_email, client_phone, status")
        .in("status", ["completed", "delivered"])
        .order("created_at", { ascending: false })
        .limit(50);
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  const calculateStats = (surveyData: Survey[]) => {
    const total = surveyData.filter(s => s.status === "sent" || s.status === "completed").length;
    const completed = surveyData.filter(s => s.status === "completed").length;
    const responses = surveyData
      .filter(s => s.survey_responses && s.survey_responses.length > 0)
      .map(s => s.survey_responses![0]);

    const avgRating = responses.length > 0
      ? responses.reduce((sum, r) => sum + r.overall_rating, 0) / responses.length
      : 0;

    const promoters = responses.filter(r => r.overall_rating >= 4).length;
    const detractors = responses.filter(r => r.overall_rating <= 2).length;
    const nps = responses.length > 0
      ? Math.round(((promoters - detractors) / responses.length) * 100)
      : 0;

    setStats({
      total,
      completed,
      avgRating,
      responseRate: total > 0 ? (completed / total) * 100 : 0,
      nps,
    });
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        order_id: orderId,
        customer_name: order.client_name,
        customer_email: order.client_email,
      });
    }
  };

  const createSurvey = async (sendNow: boolean = false) => {
    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Please fill customer details");
      return;
    }

    setIsSending(true);
    try {
      const token = generateToken();
      const expiresAt = addDays(new Date(), 14);

      const { data: survey, error } = await supabase
        .from("surveys")
        .insert({
          order_id: formData.order_id || null,
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          token,
          status: sendNow ? "sent" : "pending",
          sent_at: sendNow ? new Date().toISOString() : null,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (sendNow) {
        const surveyUrl = `${window.location.origin}/survey/${token}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          `Hi ${formData.customer_name}, thank you for choosing VibeLink Ghana! We'd love your feedback. Please take a moment to complete our survey: ${surveyUrl}`
        )}`;
        window.open(whatsappUrl, "_blank");
        toast.success("Survey created! Share the link via WhatsApp.");
      } else {
        toast.success("Survey created as draft");
      }

      setIsCreateOpen(false);
      resetForm();
      fetchSurveys();
    } catch (err) {
      console.error("Error creating survey:", err);
      toast.error("Failed to create survey");
    } finally {
      setIsSending(false);
    }
  };

  const sendSurvey = async (survey: Survey) => {
    try {
      await supabase
        .from("surveys")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", survey.id);

      const surveyUrl = `${window.location.origin}/survey/${survey.token}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `Hi ${survey.customer_name}, thank you for choosing VibeLink Ghana! We'd love your feedback. Please take a moment to complete our survey: ${surveyUrl}`
      )}`;
      window.open(whatsappUrl, "_blank");

      toast.success("Survey link ready to share");
      fetchSurveys();
    } catch (err) {
      toast.error("Failed to send survey");
    }
  };

  const deleteSurvey = async (id: string) => {
    if (!confirm("Delete this survey?")) return;
    try {
      await supabase.from("surveys").delete().eq("id", id);
      toast.success("Survey deleted");
      fetchSurveys();
    } catch (err) {
      toast.error("Failed to delete survey");
    }
  };

  const viewSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setIsViewOpen(true);
  };

  const resetForm = () => {
    setFormData({
      order_id: "",
      customer_name: "",
      customer_email: "",
    });
  };

  const filteredSurveys = surveys.filter(s => {
    return statusFilter === "all" || s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Customer Satisfaction Surveys</h2>
          <p className="text-muted-foreground">Collect and analyze customer feedback</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <MessageSquare className="h-4 w-4 mr-2" />
          New Survey
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Surveys Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.responseRate.toFixed(0)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              NPS Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stats.nps >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.nps}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Surveys Table */}
      <Card>
        <CardHeader>
          <CardTitle>Survey List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No surveys found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.map((survey) => {
                  const response = survey.survey_responses?.[0];
                  return (
                    <TableRow key={survey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{survey.customer_name}</p>
                          <p className="text-sm text-muted-foreground">{survey.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusConfig[survey.status]?.color} flex items-center gap-1 w-fit`}>
                          {statusConfig[survey.status]?.icon}
                          {survey.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {response ? (
                          <StarRating rating={response.overall_rating} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {survey.sent_at
                          ? formatDistanceToNow(new Date(survey.sent_at), { addSuffix: true })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {survey.completed_at
                          ? formatDistanceToNow(new Date(survey.completed_at), { addSuffix: true })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {response && (
                            <Button variant="ghost" size="sm" onClick={() => viewSurvey(survey)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {survey.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => sendSurvey(survey)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteSurvey(survey.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Survey Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Survey</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">From Order (Optional)</label>
              <Select value={formData.order_id} onValueChange={handleOrderSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.order_number} - {order.client_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Customer Name *</label>
              <Input
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder="Customer name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Customer Email *</label>
              <Input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => createSurvey(false)} disabled={isSending}>
              Save Draft
            </Button>
            <Button onClick={() => createSurvey(true)} disabled={isSending}>
              {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Create & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Response Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Survey Response</DialogTitle>
          </DialogHeader>

          {selectedSurvey && selectedSurvey.survey_responses?.[0] && (
            <div className="space-y-6">
              <div>
                <p className="font-medium">{selectedSurvey.customer_name}</p>
                <p className="text-sm text-muted-foreground">{selectedSurvey.customer_email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Rating</span>
                  <StarRating rating={selectedSurvey.survey_responses[0].overall_rating} size="lg" />
                </div>

                {selectedSurvey.survey_responses[0].design_quality && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Design Quality</span>
                    <StarRating rating={selectedSurvey.survey_responses[0].design_quality} />
                  </div>
                )}

                {selectedSurvey.survey_responses[0].communication && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Communication</span>
                    <StarRating rating={selectedSurvey.survey_responses[0].communication} />
                  </div>
                )}

                {selectedSurvey.survey_responses[0].delivery_speed && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery Speed</span>
                    <StarRating rating={selectedSurvey.survey_responses[0].delivery_speed} />
                  </div>
                )}

                {selectedSurvey.survey_responses[0].value_for_money && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Value for Money</span>
                    <StarRating rating={selectedSurvey.survey_responses[0].value_for_money} />
                  </div>
                )}
              </div>

              {selectedSurvey.survey_responses[0].feedback_text && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Feedback:</p>
                  <p className="text-sm">{selectedSurvey.survey_responses[0].feedback_text}</p>
                </div>
              )}

              {selectedSurvey.survey_responses[0].allow_testimonial && (
                <Badge className="bg-green-500">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Allowed as testimonial
                </Badge>
              )}

              <p className="text-xs text-muted-foreground">
                Completed {formatDistanceToNow(new Date(selectedSurvey.survey_responses[0].created_at), { addSuffix: true })}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CustomerSurveys;

