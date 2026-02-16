import { useState, useEffect } from "react";
import {
  MessageSquare, AlertTriangle, CheckCircle, Clock, User,
  Loader2, Phone, Mail, ExternalLink, Filter, Search,
  MessageCircle, UserCheck, XCircle, ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { format, formatDistanceToNow } from "date-fns";

interface Escalation {
  id: string;
  session_id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  conversation_summary: string | null;
  escalation_reason: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
}

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "bg-gray-500", label: "Low" },
  medium: { color: "bg-yellow-500", label: "Medium" },
  high: { color: "bg-orange-500", label: "High" },
  urgent: { color: "bg-red-500", label: "Urgent" },
};

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-500", icon: <Clock className="h-3 w-3" /> },
  in_progress: { color: "bg-blue-500", icon: <MessageCircle className="h-3 w-3" /> },
  resolved: { color: "bg-green-500", icon: <CheckCircle className="h-3 w-3" /> },
  closed: { color: "bg-gray-500", icon: <XCircle className="h-3 w-3" /> },
};

const escalationReasons = [
  "Complex inquiry - needs human assistance",
  "Pricing/Quote request",
  "Complaint or issue",
  "Custom order request",
  "Technical problem",
  "Payment issue",
  "Urgent delivery request",
  "Unable to understand query",
  "Customer requested human agent",
  "Other"
];

export function ChatbotEscalation() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResponseTime: "N/A"
  });

  useEffect(() => {
    fetchEscalations();
    const subscription = supabase
      .channel('escalations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chatbot_escalations' }, fetchEscalations)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchEscalations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("chatbot_escalations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEscalations(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching escalations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Escalation[]) => {
    const pending = data.filter(e => e.status === "pending").length;
    const inProgress = data.filter(e => e.status === "in_progress").length;
    const resolved = data.filter(e => e.status === "resolved" || e.status === "closed").length;

    setStats({
      total: data.length,
      pending,
      inProgress,
      resolved,
      avgResponseTime: "< 30 min"
    });
  };

  const updateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      const updates: any = { status };
      if (status === "in_progress") {
        updates.assigned_to = "Admin";
      }
      if (status === "resolved" || status === "closed") {
        updates.resolved_at = new Date().toISOString();
      }

      await supabase.from("chatbot_escalations").update(updates).eq("id", id);
      toast.success(`Status updated to ${status}`);
      fetchEscalations();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const resolveEscalation = async () => {
    if (!selectedEscalation) return;
    setIsUpdating(true);

    try {
      await supabase.from("chatbot_escalations").update({
        status: "resolved",
        resolution_notes: resolutionNotes,
        resolved_at: new Date().toISOString()
      }).eq("id", selectedEscalation.id);

      toast.success("Escalation resolved!");
      setIsResolveOpen(false);
      setResolutionNotes("");
      fetchEscalations();
    } catch (err) {
      toast.error("Failed to resolve escalation");
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePriority = async (id: string, priority: string) => {
    try {
      await supabase.from("chatbot_escalations").update({ priority }).eq("id", id);
      toast.success("Priority updated");
      fetchEscalations();
    } catch (err) {
      toast.error("Failed to update priority");
    }
  };

  const viewDetails = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setIsDetailOpen(true);
  };

  const openResolveDialog = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setResolutionNotes(escalation.resolution_notes || "");
    setIsResolveOpen(true);
  };

  const contactCustomer = (type: "phone" | "email" | "whatsapp", escalation: Escalation) => {
    if (type === "phone" && escalation.customer_phone) {
      window.open(`tel:${escalation.customer_phone}`);
    } else if (type === "email" && escalation.customer_email) {
      window.open(`mailto:${escalation.customer_email}?subject=Re: Your inquiry with VibeLink Event`);
    } else if (type === "whatsapp" && escalation.customer_phone) {
      const phone = escalation.customer_phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}?text=Hi ${escalation.customer_name || 'there'}, this is VibeLink Event following up on your inquiry.`);
    }
  };

  const filteredEscalations = escalations.filter(e => {
    const matchesSearch =
      (e.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (e.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      e.escalation_reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || e.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Chatbot Escalations
          </h2>
          <p className="text-muted-foreground">Manage conversations that need human attention</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Escalations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Escalations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredEscalations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No escalations found</p>
              <p className="text-sm">All conversations are being handled by the chatbot</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEscalations.map((escalation) => (
                  <TableRow key={escalation.id} className={escalation.priority === 'urgent' ? 'bg-red-50' : ''}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{escalation.customer_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {escalation.customer_email || escalation.customer_phone || 'No contact'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-xs truncate">{escalation.escalation_reason}</p>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={escalation.priority}
                        onValueChange={(v) => updatePriority(escalation.id, v)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <Badge className={priorityConfig[escalation.priority]?.color}>
                            {priorityConfig[escalation.priority]?.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[escalation.status]?.color} flex items-center gap-1 w-fit`}>
                        {statusConfig[escalation.status]?.icon}
                        {escalation.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => viewDetails(escalation)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {escalation.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateStatus(escalation.id, "in_progress")}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {(escalation.status === "pending" || escalation.status === "in_progress") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openResolveDialog(escalation)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Escalation Details</DialogTitle>
          </DialogHeader>

          {selectedEscalation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={priorityConfig[selectedEscalation.priority]?.color}>
                  {priorityConfig[selectedEscalation.priority]?.label} Priority
                </Badge>
                <Badge className={statusConfig[selectedEscalation.status]?.color}>
                  {selectedEscalation.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground">Customer</Label>
                  <p className="font-medium">{selectedEscalation.customer_name || 'Unknown'}</p>
                </div>

                {selectedEscalation.customer_email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{selectedEscalation.customer_email}</p>
                  </div>
                )}

                {selectedEscalation.customer_phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{selectedEscalation.customer_phone}</p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Escalation Reason</Label>
                  <p>{selectedEscalation.escalation_reason}</p>
                </div>

                {selectedEscalation.conversation_summary && (
                  <div>
                    <Label className="text-muted-foreground">Conversation Summary</Label>
                    <p className="text-sm bg-muted p-3 rounded">{selectedEscalation.conversation_summary}</p>
                  </div>
                )}

                {selectedEscalation.resolution_notes && (
                  <div>
                    <Label className="text-muted-foreground">Resolution Notes</Label>
                    <p className="text-sm bg-green-50 p-3 rounded">{selectedEscalation.resolution_notes}</p>
                  </div>
                )}

                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{format(new Date(selectedEscalation.created_at), "PPP 'at' p")}</p>
                </div>

                {selectedEscalation.resolved_at && (
                  <div>
                    <Label className="text-muted-foreground">Resolved</Label>
                    <p>{format(new Date(selectedEscalation.resolved_at), "PPP 'at' p")}</p>
                  </div>
                )}
              </div>

              {(selectedEscalation.customer_phone || selectedEscalation.customer_email) && (
                <div className="flex gap-2 pt-4 border-t">
                  {selectedEscalation.customer_phone && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => contactCustomer("phone", selectedEscalation)}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => contactCustomer("whatsapp", selectedEscalation)}>
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                  {selectedEscalation.customer_email && (
                    <Button variant="outline" size="sm" onClick={() => contactCustomer("email", selectedEscalation)}>
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedEscalation && selectedEscalation.status !== "resolved" && (
              <Button onClick={() => { setIsDetailOpen(false); openResolveDialog(selectedEscalation); }}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Escalation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how this was resolved..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={resolveEscalation} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Mark Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ChatbotEscalation;

