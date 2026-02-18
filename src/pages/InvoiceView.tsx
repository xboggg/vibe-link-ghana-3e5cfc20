import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2, AlertCircle, Printer, Download, CheckCircle,
  Clock, Building2, Phone, Mail, MapPin, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_address: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: string;
  due_date: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  invoice_items?: InvoiceItem[];
}

const statusConfig: Record<string, { color: string; label: string; bgColor: string }> = {
  draft: { color: "text-gray-600", label: "Draft", bgColor: "bg-gray-100" },
  sent: { color: "text-blue-600", label: "Awaiting Payment", bgColor: "bg-blue-100" },
  viewed: { color: "text-purple-600", label: "Viewed", bgColor: "bg-purple-100" },
  paid: { color: "text-green-600", label: "Paid", bgColor: "bg-green-100" },
  overdue: { color: "text-red-600", label: "Overdue", bgColor: "bg-red-100" },
  cancelled: { color: "text-gray-500", label: "Cancelled", bgColor: "bg-gray-100" },
};

const InvoiceView = () => {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoiceNumber) {
      fetchInvoice();
    }
  }, [invoiceNumber]);

  const fetchInvoice = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("invoice_number", invoiceNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setError("Invoice not found. Please check the invoice number.");
        } else {
          throw error;
        }
        return;
      }

      setInvoice(data);

      // Mark as viewed if status is "sent"
      if (data.status === "sent") {
        await supabase
          .from("invoices")
          .update({ status: "viewed", viewed_at: new Date().toISOString() })
          .eq("id", data.id);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to load invoice. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Invoice Not Found</h1>
            <p className="text-muted-foreground mb-6">{error || "The invoice you're looking for doesn't exist."}</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[invoice.status] || statusConfig.draft;
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.due_date && new Date(invoice.due_date) < new Date() && !isPaid;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto">
        {/* Action Buttons - Hidden on print */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Link to="/" className="text-primary hover:underline text-sm">
            ← Back to VibeLink
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg print:shadow-none print:border-none">
            <CardContent className="p-8 print:p-0">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                      <span className="text-xl font-bold text-white">V</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">VibeLink Event</h1>
                      <p className="text-sm text-muted-foreground">Premium Digital Invitations</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>0245817973 / 0244147594</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>hello@vibelinkevent.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>Accra, Ghana</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <p className="font-mono text-lg font-semibold text-primary">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Issued: {format(new Date(invoice.created_at), "MMMM d, yyyy")}
                  </p>
                  {invoice.due_date && (
                    <p className="text-sm text-muted-foreground flex items-center justify-end gap-1 mt-1">
                      <Calendar className="h-4 w-4" />
                      Due: {format(new Date(invoice.due_date), "MMMM d, yyyy")}
                    </p>
                  )}
                  <div className="mt-3">
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color} font-medium`}>
                      {isOverdue ? "Overdue" : statusInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Bill To */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Bill To</h3>
                <div className="bg-gray-50 rounded-lg p-4 print:bg-transparent print:p-0">
                  <p className="text-lg font-semibold text-gray-900">{invoice.customer_name}</p>
                  <p className="text-muted-foreground">{invoice.customer_email}</p>
                  {invoice.customer_phone && (
                    <p className="text-muted-foreground">{invoice.customer_phone}</p>
                  )}
                  {invoice.customer_address && (
                    <p className="text-muted-foreground mt-1">{invoice.customer_address}</p>
                  )}
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items</h3>
                <div className="border rounded-lg overflow-hidden print:border-gray-300">
                  <table className="w-full">
                    <thead className="bg-gray-50 print:bg-gray-100">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 w-20">Qty</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-28">Price</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 w-28">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.invoice_items?.map((item, idx) => (
                        <tr key={item.id || idx} className="border-t">
                          <td className="py-3 px-4 text-gray-900">{item.description}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-gray-600">GH₵{item.unit_price.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-900">GH₵{item.total.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>GH₵{invoice.subtotal.toLocaleString()}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-GH₵{invoice.discount.toLocaleString()}</span>
                    </div>
                  )}
                  {invoice.tax > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Tax</span>
                      <span>GH₵{invoice.tax.toLocaleString()}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>GH₵{invoice.total.toLocaleString()}</span>
                  </div>
                  {isPaid && invoice.paid_at && (
                    <div className="flex items-center justify-end gap-2 text-green-600 text-sm mt-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Paid on {format(new Date(invoice.paid_at), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4 print:bg-transparent print:p-0">
                    {invoice.notes}
                  </p>
                </div>
              )}

              {/* Payment Instructions - Only show if not paid */}
              {!isPaid && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 print:border-gray-300">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Methods</h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Mobile Money (MoMo)</p>
                      <p className="text-muted-foreground">MTN: 024 XXX XXXX</p>
                      <p className="text-muted-foreground">Vodafone: 020 XXX XXXX</p>
                      <p className="text-muted-foreground">Name: VibeLink Event</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Bank Transfer</p>
                      <p className="text-muted-foreground">Bank: [Bank Name]</p>
                      <p className="text-muted-foreground">Account: [Account Number]</p>
                      <p className="text-muted-foreground">Name: VibeLink Event</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Please include invoice number <span className="font-mono font-semibold">{invoice.invoice_number}</span> as reference when making payment.
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>Thank you for choosing VibeLink Event!</p>
                <p className="mt-1">Questions? Contact us at hello@vibelinkevent.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Powered by footer - Hidden on print */}
        <div className="text-center mt-6 text-sm text-muted-foreground print:hidden">
          <p>Powered by <Link to="/" className="text-primary hover:underline">VibeLink Event</Link></p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;
