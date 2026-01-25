import { useState, useEffect } from "react";
import {
  Clock, Package, Palette, Eye, CheckCircle,
  FileEdit, Send, PartyPopper, XCircle, ExternalLink, Copy, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Order {
  id: string;
  event_title: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  deposit_paid: boolean;
  balance_paid: boolean;
  final_link?: string | null;
}

interface TimelineEvent {
  id: string;
  status: string;
  message: string;
  created_at: string | null;
  metadata?: unknown;
}

interface OrderTimelineProps {
  order: Order;
}

const statusSteps = [
  { key: "pending", label: "Order Received", icon: Package, description: "Your order has been received" },
  { key: "in_progress", label: "Design in Progress", icon: Palette, description: "Our designers are working on your invitation" },
  { key: "draft_ready", label: "Draft Ready", icon: Eye, description: "Your draft is ready for review" },
  { key: "revision", label: "Revision", icon: FileEdit, description: "Making requested changes" },
  { key: "completed", label: "Completed", icon: CheckCircle, description: "Your invitation is complete!" },
];

const getStepIndex = (status: string) => {
  const index = statusSteps.findIndex(s => s.key === status);
  return index === -1 ? 0 : index;
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimelineEvents();
  }, [order.id]);

  const fetchTimelineEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("order_timeline")
        .select("*")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = getStepIndex(order.order_status);
  const isCancelled = order.order_status === "cancelled";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        <div className="relative mb-8">
          <div className="flex justify-between">
            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex && !isCancelled;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCancelled
                        ? "bg-red-100 text-red-600"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCancelled && index === currentStepIndex ? (
                      <XCircle className="h-5 w-5" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className={`text-xs mt-2 text-center max-w-[80px] ${
                    isCurrent ? "font-semibold text-primary" : "text-muted-foreground"
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted -z-0">
            <div
              className={`h-full transition-all ${isCancelled ? "bg-red-500" : "bg-green-500"}`}
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className={`p-4 rounded-lg mb-6 ${
          isCancelled
            ? "bg-red-50 border border-red-200"
            : "bg-primary/5 border border-primary/20"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Badge className={isCancelled ? "bg-red-500" : "bg-primary"}>
              {isCancelled ? "Cancelled" : statusSteps[currentStepIndex]?.label}
            </Badge>
          </div>
          <p className={`text-sm ${isCancelled ? "text-red-700" : "text-muted-foreground"}`}>
            {isCancelled
              ? "This order has been cancelled"
              : statusSteps[currentStepIndex]?.description}
          </p>
        </div>

        {/* Final Invitation Link - Show when completed and link is available */}
        {order.order_status === "completed" && order.final_link && (
          <div className="mb-6 p-5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <PartyPopper className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800 dark:text-green-200">Your Invitation is Ready!</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Share it with your guests</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 mb-3 border border-green-200 dark:border-green-800">
              <a
                href={`https://${order.final_link.replace(/^https?:\/\//, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium flex items-center gap-2 break-all"
              >
                {order.final_link}
                <ExternalLink className="h-4 w-4 flex-shrink-0" />
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white dark:bg-gray-900"
                onClick={() => {
                  navigator.clipboard.writeText(`https://${order.final_link?.replace(/^https?:\/\//, '')}`);
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white dark:bg-gray-900 text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => {
                  const url = `https://${order.final_link?.replace(/^https?:\/\//, '')}`;
                  const text = encodeURIComponent(`Check out my event invitation: ${url}`);
                  window.open(`https://wa.me/?text=${text}`, '_blank');
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share via WhatsApp
              </Button>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  window.open(`https://${order.final_link?.replace(/^https?:\/\//, '')}`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Invitation
              </Button>
            </div>
          </div>
        )}

        {/* Timeline Events */}
        {events.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground">Activity Log</h4>
            <div className="space-y-3">
              {events.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full bg-muted flex-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.created_at ? format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a") : 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Created */}
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-muted-foreground">
            Order placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrderTimeline;

