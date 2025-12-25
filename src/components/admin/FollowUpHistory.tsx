import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle, Mail, Filter, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface FollowUpLog {
  id: string;
  order_id: string;
  follow_up_type: string;
  sent_at: string;
  success: boolean;
  error_message: string | null;
  orders?: {
    client_name: string;
    client_email: string;
    event_title: string;
  } | null;
}

const followUpTypeLabels: Record<string, { label: string; color: string }> = {
  payment_reminder_3day: { 
    label: "3-Day Payment Reminder", 
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
  },
  payment_reminder_7day: { 
    label: "7-Day Payment Reminder", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
  },
  draft_review_reminder: { 
    label: "Draft Review Reminder", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
  },
  thank_you: { 
    label: "Thank You Email", 
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
  },
};

export const FollowUpHistory = () => {
  const [logs, setLogs] = useState<FollowUpLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("follow_up_logs")
      .select(`
        *,
        orders (
          client_name,
          client_email,
          event_title
        )
      `)
      .order("sent_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching follow-up logs:", error);
    } else {
      setLogs((data as FollowUpLog[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "success") return log.success;
    if (filter === "failed") return !log.success;
    return log.follow_up_type === filter;
  });

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.success).length,
    failed: logs.filter((l) => !l.success).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Follow-up Email History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emails</SelectItem>
                  <SelectItem value="success">Successful Only</SelectItem>
                  <SelectItem value="failed">Failed Only</SelectItem>
                  <SelectItem value="payment_reminder_3day">3-Day Payment Reminder</SelectItem>
                  <SelectItem value="payment_reminder_7day">7-Day Payment Reminder</SelectItem>
                  <SelectItem value="draft_review_reminder">Draft Review Reminder</SelectItem>
                  <SelectItem value="thank_you">Thank You Email</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchLogs}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No follow-up emails yet</h3>
              <p className="text-muted-foreground">
                Automated follow-up emails will appear here when sent.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const typeInfo = followUpTypeLabels[log.follow_up_type] || {
                      label: log.follow_up_type.replace(/_/g, " "),
                      color: "bg-gray-100 text-gray-800",
                    };
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div>
                            <div>{format(new Date(log.sent_at), "MMM d, yyyy")}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(log.sent_at), "h:mm a")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.orders?.client_name || "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {log.orders?.client_email || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.orders?.event_title || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.success ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600">Sent</span>
                              </>
                            ) : (
                              <div>
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-sm text-red-600">Failed</span>
                                </div>
                                {log.error_message && (
                                  <p className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                                    {log.error_message}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
