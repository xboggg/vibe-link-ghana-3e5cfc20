import { useState, useEffect } from "react";
import { FileEdit, Send, Loader2, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Order {
  id: string;
  event_title: string;
  order_status: string;
  client_email: string;
}

interface RevisionEntry {
  id: string;
  order_id: string;
  request_text: string;
  status: string;
  admin_response?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface RevisionRequestProps {
  order: Order;
}

export function RevisionRequest({ order }: RevisionRequestProps) {
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [newRequest, setNewRequest] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRevisions();
  }, [order.id]);

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_revisions")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRevisions(data || []);
    } catch (err) {
      console.error("Error fetching revisions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRevision = async () => {
    if (!newRequest.trim()) {
      toast.error("Please describe the changes you need");
      return;
    }

    if (newRequest.trim().length < 10) {
      toast.error("Please provide more details about your revision request");
      return;
    }

    setIsSubmitting(true);
    try {
      // Use secure RPC function that handles both insert and order status update
      const { error } = await supabase.rpc('submit_revision_request', {
        p_order_id: order.id,
        p_request_text: newRequest.trim()
      });

      if (error) throw error;

      toast.success("Revision request submitted!");
      setNewRequest("");
      fetchRevisions();
    } catch (err) {
      console.error("Error submitting revision:", err);
      toast.error("Failed to submit revision request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canRequestRevision = ["draft_ready", "revision"].includes(order.order_status);
  const hasPendingRevision = revisions.some(r => r.status === "pending" || r.status === "in_progress");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Request Revisions
        </CardTitle>
        <CardDescription>
          Need changes to your design? Submit a revision request below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Revision Request */}
        {canRequestRevision && !hasPendingRevision ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the changes you'd like us to make... (e.g., 'Please change the background color to gold' or 'Update the venue address to...')"
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Be as specific as possible to help us make the right changes.
              </p>
              <Button onClick={submitRevision} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Request
              </Button>
            </div>
          </div>
        ) : hasPendingRevision ? (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100">Revision in Progress</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  You have a pending revision request. Please wait for our team to complete it before submitting another.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Revisions Not Available</p>
                <p className="text-sm text-muted-foreground">
                  {order.order_status === "completed"
                    ? "This order has been completed. Contact us if you need any changes."
                    : order.order_status === "cancelled"
                    ? "This order has been cancelled."
                    : "Revisions can be requested once your draft is ready for review."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Revision History */}
        {revisions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Revision History
            </h4>
            <div className="space-y-4">
              {revisions.map((revision) => (
                <div
                  key={revision.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {revision.created_at ? format(new Date(revision.created_at), "MMM d, yyyy 'at' h:mm a") : 'Unknown'}
                      </p>
                    </div>
                    {getStatusBadge(revision.status)}
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-medium mb-1">Your Request:</p>
                    <p className="text-sm">{revision.request_text}</p>
                  </div>

                  {revision.admin_response && (
                    <div className="bg-primary/5 p-3 rounded-lg border-l-2 border-primary">
                      <p className="text-sm font-medium mb-1">Our Response:</p>
                      <p className="text-sm">{revision.admin_response}</p>
                    </div>
                  )}

                  {revision.status === "completed" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Changes applied</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {revisions.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-4">
            No revision requests yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default RevisionRequest;

