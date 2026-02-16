import { useState, useEffect } from "react";
import {
  Sparkles, FileText, Copy, Download, Loader2, RefreshCw,
  Package, Calendar, User, Clock, CheckCircle, AlertTriangle,
  Printer, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { format, formatDistanceToNow, differenceInDays } from "date-fns";

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_whatsapp: string | null;
  event_type: string;
  event_date: string | null;
  event_title: string;
  package_name: string;
  total_price: number;
  deposit_amount: number | null;
  balance_amount: number | null;
  order_status: string;
  special_requests: string | null;
  created_at: string;
}

interface Summary {
  id: string;
  order_id: string;
  summary_type: string;
  content: string;
  created_at: string;
}

type SummaryType = "brief" | "detailed" | "client_facing" | "production" | "whatsapp";

const summaryTypeConfig: Record<SummaryType, { label: string; description: string }> = {
  brief: { label: "Brief Summary", description: "Quick overview for internal use" },
  detailed: { label: "Detailed Summary", description: "Comprehensive order details" },
  client_facing: { label: "Client Summary", description: "Professional summary for customers" },
  production: { label: "Production Brief", description: "Key details for production team" },
  whatsapp: { label: "WhatsApp Message", description: "Short message for WhatsApp" }
};

export function AIOrderSummarizer() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [summaryType, setSummaryType] = useState<SummaryType>("brief");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [savedSummaries, setSavedSummaries] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = (order: Order, type: SummaryType): string => {
    const daysUntilEvent = order.event_date ? differenceInDays(new Date(order.event_date), new Date()) : 0;
    const isUrgent = daysUntilEvent <= 3 && daysUntilEvent >= 0;
    const balanceDue = (order.balance_amount || 0);
    const isPaid = balanceDue <= 0;
    const orderNumber = order.id.slice(0, 8).toUpperCase();

    switch (type) {
      case "brief":
        return `ORDER SUMMARY - ${orderNumber}
————————————————————————————————
Client: ${order.client_name}
Event: ${order.event_type} | ${order.package_name}
Date: ${order.event_date ? format(new Date(order.event_date), "EEEE, MMMM d, yyyy") : 'TBD'}
${daysUntilEvent > 0 ? `(${daysUntilEvent} days away)` : daysUntilEvent === 0 ? '(TODAY!)' : '(Past event)'}

Status: ${order.order_status.toUpperCase()}${isUrgent ? ' ⚠️ URGENT' : ''}
Payment: ${isPaid ? '✓ Fully Paid' : `GHS ${balanceDue} pending`}
Total: GHS ${order.total_price.toLocaleString()}

Contact: ${order.client_phone}`;

      case "detailed":
        return `DETAILED ORDER REPORT
═══════════════════════════════════════════════════════
ORDER #${orderNumber}
Created: ${format(new Date(order.created_at), "PPP 'at' p")}

CLIENT INFORMATION
———————————————————————————————
Name: ${order.client_name}
Email: ${order.client_email}
Phone: ${order.client_phone}
WhatsApp: ${order.client_whatsapp || order.client_phone}

EVENT DETAILS
———————————————————————————————
Type: ${order.event_type}
Title: ${order.event_title}
Date: ${order.event_date ? format(new Date(order.event_date), "EEEE, MMMM d, yyyy") : 'TBD'}
Time Until Event: ${daysUntilEvent > 0 ? `${daysUntilEvent} days` : daysUntilEvent === 0 ? 'TODAY' : `${Math.abs(daysUntilEvent)} days ago`}
Package: ${order.package_name}

FINANCIAL SUMMARY
———————————————————————————————
Total Price: GHS ${order.total_price.toLocaleString()}
Deposit Paid: GHS ${(order.deposit_amount || 0).toLocaleString()}
Balance Due: GHS ${balanceDue.toLocaleString()}
Payment Status: ${isPaid ? 'PAID IN FULL' : 'PENDING BALANCE'}

ORDER STATUS
———————————————————————————————
Current Status: ${order.order_status.toUpperCase()}
${isUrgent ? '⚠️ URGENT: Event is within 3 days!' : ''}

SPECIAL REQUESTS
———————————————————————————————
${order.special_requests || 'No additional notes'}

═══════════════════════════════════════════════════════
Generated by VibeLink Event | ${format(new Date(), "PPP")}`;

      case "client_facing":
        return `Dear ${order.client_name},

Thank you for choosing VibeLink Event for your ${order.event_type}!

Here's a summary of your order:

📋 Order Number: ${orderNumber}
📅 Event Date: ${order.event_date ? format(new Date(order.event_date), "EEEE, MMMM d, yyyy") : 'TBD'}
📦 Package: ${order.package_name}

💰 Order Total: GHS ${order.total_price.toLocaleString()}
${!isPaid ? `💳 Balance Due: GHS ${balanceDue.toLocaleString()}` : '✅ Payment Complete - Thank you!'}

Your order status: ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}

${daysUntilEvent > 0 && daysUntilEvent <= 7 ? `We're getting everything ready for your event in ${daysUntilEvent} days!` : ''}

If you have any questions, please don't hesitate to reach out.

Best regards,
VibeLink Event Team`;

      case "production":
        return `PRODUCTION BRIEF
————————————————————————————————

ORDER: ${orderNumber}
DEADLINE: ${order.event_date ? format(new Date(order.event_date), "EEE, MMM d") : 'TBD'} ${isUrgent ? '⚠️ RUSH' : ''}

PACKAGE: ${order.package_name}
EVENT: ${order.event_type}

CLIENT: ${order.client_name}
CONTACT: ${order.client_phone}

PAYMENT: ${isPaid ? 'CLEARED ✓' : 'PENDING'}

SPECIAL REQUESTS:
${order.special_requests || 'None'}

———————————————————————————————
Days to deadline: ${daysUntilEvent > 0 ? daysUntilEvent : 'OVERDUE'}`;

      case "whatsapp":
        return `Hi ${order.client_name.split(' ')[0]}! 👋

Quick update on your order #${orderNumber}:

📅 ${order.event_type} - ${order.event_date ? format(new Date(order.event_date), "MMM d, yyyy") : 'TBD'}
📦 ${order.package_name}
${!isPaid ? `💳 Balance: GHS ${balanceDue.toLocaleString()}` : '✅ Paid'}

Status: ${order.order_status}

${daysUntilEvent > 0 && daysUntilEvent <= 5 ? `Only ${daysUntilEvent} days to go! 🎉` : ''}

Any questions? Just reply! 💬

- VibeLink Event`;

      default:
        return "";
    }
  };

  const handleGenerateSummary = (order: Order) => {
    setSelectedOrder(order);
    setIsGenerating(true);

    setTimeout(() => {
      const summary = generateSummary(order, summaryType);
      setGeneratedSummary(summary);
      setIsGenerating(false);
      setIsSummaryOpen(true);
    }, 500);
  };

  const regenerateSummary = () => {
    if (!selectedOrder) return;
    setIsGenerating(true);

    setTimeout(() => {
      const summary = generateSummary(selectedOrder, summaryType);
      setGeneratedSummary(summary);
      setIsGenerating(false);
    }, 300);
  };

  const saveSummary = async () => {
    if (!selectedOrder || !generatedSummary) return;

    try {
      const orderNumber = selectedOrder.id.slice(0, 8).toUpperCase();
      await supabase.from("ai_generated_content").insert({
        content_type: "order_summary",
        title: `${summaryTypeConfig[summaryType].label} - ${orderNumber}`,
        content: generatedSummary,
        metadata: {
          order_id: selectedOrder.id,
          order_number: orderNumber,
          summary_type: summaryType
        },
        status: "approved"
      });
      toast.success("Summary saved!");
    } catch (err) {
      toast.error("Failed to save summary");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSummary);
    toast.success("Copied to clipboard!");
  };

  const shareViaWhatsApp = () => {
    if (!selectedOrder) return;
    const message = encodeURIComponent(generatedSummary);
    const phone = selectedOrder.client_whatsapp || selectedOrder.client_phone;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const printSummary = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const orderNumber = selectedOrder?.id.slice(0, 8).toUpperCase() || '';
      printWindow.document.write(`
        <html>
          <head>
            <title>Order Summary - ${orderNumber}</title>
            <style>
              body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
            </style>
          </head>
          <body>${generatedSummary}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'delivered': return 'bg-green-500';
      case 'in_progress': case 'processing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Order Summarizer
          </h2>
          <p className="text-muted-foreground">Generate smart summaries for any order</p>
        </div>
        <Select value={summaryType} onValueChange={(v) => setSummaryType(v as SummaryType)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(summaryTypeConfig).map(([type, config]) => (
              <SelectItem key={type} value={type}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Type Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(summaryTypeConfig).map(([type, config]) => (
          <Card
            key={type}
            className={`cursor-pointer transition-all ${summaryType === type ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
            onClick={() => setSummaryType(type as SummaryType)}
          >
            <CardContent className="p-4">
              <p className="font-medium text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Click "Summarize" to generate an AI summary</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const daysUntil = differenceInDays(new Date(order.event_date), new Date());
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.client_name}</p>
                          <p className="text-xs text-muted-foreground">{order.client_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.event_type}</p>
                          <p className="text-xs text-muted-foreground">{order.package_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{order.event_date ? format(new Date(order.event_date), "MMM d, yyyy") : 'TBD'}</p>
                          <p className={`text-xs ${daysUntil <= 3 && daysUntil >= 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                            {daysUntil > 0 ? `${daysUntil} days` : daysUntil === 0 ? 'Today!' : 'Past'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateSummary(order)}
                        >
                          <Sparkles className="h-4 w-4 mr-1" />
                          Summarize
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Summary Dialog */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {summaryTypeConfig[summaryType].label}
              {selectedOrder && (
                <Badge variant="outline" className="ml-2">
                  {selectedOrder.id.slice(0, 8).toUpperCase()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Select value={summaryType} onValueChange={(v) => {
              setSummaryType(v as SummaryType);
              if (selectedOrder) {
                setGeneratedSummary(generateSummary(selectedOrder, v as SummaryType));
              }
            }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(summaryTypeConfig).map(([type, config]) => (
                  <SelectItem key={type} value={type}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              value={generatedSummary}
              onChange={(e) => setGeneratedSummary(e.target.value)}
              className="min-h-[350px] font-mono text-sm"
              placeholder="Generated summary will appear here..."
            />

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" onClick={regenerateSummary} disabled={isGenerating}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button variant="outline" onClick={printSummary}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              {summaryType === 'whatsapp' && (
                <Button variant="outline" onClick={shareViaWhatsApp}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Send via WhatsApp
                </Button>
              )}
              <Button onClick={saveSummary}>
                <FileText className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSummaryOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIOrderSummarizer;

