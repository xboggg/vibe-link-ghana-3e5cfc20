import { useState, useEffect } from "react";
import {
  Mail, Sparkles, Copy, Save, Loader2, Send, FileText,
  RefreshCw, Trash2, Edit, Check, Wand2
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

interface EmailTemplate {
  id: string;
  content_type: string;
  title: string | null;
  content: string;
  prompt_used: string | null;
  metadata: any;
  status: string;
  created_at: string;
}

type EmailType = "order_confirmation" | "payment_reminder" | "delivery_notification" |
                 "follow_up" | "thank_you" | "promotional" | "survey_request";

const emailTypeConfig: Record<EmailType, { label: string; description: string }> = {
  order_confirmation: {
    label: "Order Confirmation",
    description: "Confirm new order details"
  },
  payment_reminder: {
    label: "Payment Reminder",
    description: "Gentle payment reminder"
  },
  delivery_notification: {
    label: "Delivery Notification",
    description: "Order delivery update"
  },
  follow_up: {
    label: "Follow Up",
    description: "Check in with customer"
  },
  thank_you: {
    label: "Thank You",
    description: "Express gratitude"
  },
  promotional: {
    label: "Promotional",
    description: "Special offers & discounts"
  },
  survey_request: {
    label: "Survey Request",
    description: "Request feedback"
  }
};

const emailTemplates: Record<EmailType, (vars: any) => string> = {
  order_confirmation: (vars) => `Subject: Your VibeLink Order #${vars.orderNumber} is Confirmed!

Dear ${vars.customerName},

Thank you for choosing VibeLink Ghana for your ${vars.eventType}! We're excited to work with you.

Order Details:
- Order Number: ${vars.orderNumber}
- Event Type: ${vars.eventType}
- Package: ${vars.packageName}
- Event Date: ${vars.eventDate}
- Total: GHS ${vars.totalPrice}

What's Next?
1. Our design team will begin working on your order
2. You'll receive a preview within ${vars.previewDays || 3} business days
3. Feel free to reach out if you have any questions

Payment Information:
${vars.paymentStatus === 'paid' ? 'Payment received - Thank you!' : `Please complete your payment of GHS ${vars.amountDue} to confirm your order.`}

Contact us anytime:
WhatsApp: ${vars.businessWhatsApp || '+233 XX XXX XXXX'}
Email: ${vars.businessEmail || 'hello@vibelinkghana.com'}

Best regards,
The VibeLink Ghana Team`,

  payment_reminder: (vars) => `Subject: Friendly Reminder: Payment Due for Order #${vars.orderNumber}

Dear ${vars.customerName},

We hope this message finds you well! This is a gentle reminder about your pending payment for:

Order #${vars.orderNumber}
Amount Due: GHS ${vars.amountDue}
Due Date: ${vars.dueDate}

To ensure we can proceed with your ${vars.eventType} order on time, please complete your payment at your earliest convenience.

Payment Options:
- Mobile Money: ${vars.momoNumber || 'XXX XXX XXXX'}
- Bank Transfer: ${vars.bankDetails || 'Contact us for details'}

If you've already made the payment, please disregard this message and kindly send us the confirmation.

Thank you for your business!

Best regards,
VibeLink Ghana`,

  delivery_notification: (vars) => `Subject: Your Order #${vars.orderNumber} is Ready!

Dear ${vars.customerName},

Great news! Your ${vars.eventType} order is complete and ready for ${vars.deliveryMethod === 'pickup' ? 'pickup' : 'delivery'}!

${vars.deliveryMethod === 'pickup' ? `
Pickup Location: ${vars.pickupLocation || 'Our office'}
Available Times: ${vars.pickupTimes || 'Monday-Friday, 9AM-5PM'}
` : `
Delivery Address: ${vars.deliveryAddress}
Expected Delivery: ${vars.deliveryDate}
`}

Please have your order number ready: ${vars.orderNumber}

If you have any questions, don't hesitate to reach out!

Thank you for choosing VibeLink Ghana.

Best regards,
The VibeLink Team`,

  follow_up: (vars) => `Subject: How Was Your Experience with VibeLink?

Dear ${vars.customerName},

We hope your ${vars.eventType} was amazing! We'd love to hear how everything went.

It's been ${vars.daysSinceEvent || 'a few days'} since your event, and your feedback means the world to us.

Quick Questions:
- Did our designs meet your expectations?
- Was the delivery/pickup smooth?
- Is there anything we could improve?

Simply reply to this email with your thoughts, or click here to leave a quick review: ${vars.reviewLink || '[Review Link]'}

Thank you for trusting VibeLink Ghana with your special occasion!

Warm regards,
The VibeLink Team`,

  thank_you: (vars) => `Subject: Thank You for Choosing VibeLink Ghana!

Dear ${vars.customerName},

We wanted to take a moment to express our heartfelt gratitude for choosing VibeLink Ghana for your ${vars.eventType}.

It was truly a pleasure working with you, and we hope our designs made your occasion even more special.

As a token of our appreciation, here's a special offer for your next order:
Use code THANKYOU15 for 15% off your next purchase!

We'd be honored to serve you again. Follow us on social media for inspiration and updates:
- Instagram: @vibelinkghana
- Facebook: VibeLink Ghana

With gratitude,
The VibeLink Ghana Family`,

  promotional: (vars) => `Subject: Special Offer Just for You!

Dear ${vars.customerName || 'Valued Customer'},

We have an exciting offer we couldn't wait to share with you!

${vars.promoTitle || 'Limited Time Offer'}
${vars.promoDescription || 'Get amazing discounts on your next order!'}

Offer Details:
- Discount: ${vars.discount || '20%'} off
- Valid Until: ${vars.validUntil || 'Limited time'}
- Promo Code: ${vars.promoCode || 'SPECIAL20'}

Browse our latest designs and packages at vibelinkghana.com

Don't miss out!

Best,
VibeLink Ghana`,

  survey_request: (vars) => `Subject: We Value Your Feedback!

Dear ${vars.customerName},

Thank you for your recent order with VibeLink Ghana! We're constantly striving to improve, and your feedback is invaluable.

Would you take 2 minutes to share your experience?

Click here to complete our quick survey: ${vars.surveyLink || '[Survey Link]'}

Your responses help us serve you better!

As a thank you, you'll receive a 10% discount code for your next order upon completion.

Best regards,
The VibeLink Ghana Team`
};

export function AIEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [selectedType, setSelectedType] = useState<EmailType>("order_confirmation");

  const [variables, setVariables] = useState({
    customerName: "",
    orderNumber: "",
    eventType: "",
    packageName: "",
    eventDate: "",
    totalPrice: "",
    amountDue: "",
    dueDate: "",
    paymentStatus: "pending",
    deliveryMethod: "delivery",
    deliveryAddress: "",
    deliveryDate: "",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("ai_generated_content")
        .select("*")
        .eq("content_type", "email_template")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEmail = async () => {
    setIsGenerating(true);
    try {
      const templateFn = emailTemplates[selectedType];
      const generated = templateFn(variables);
      setGeneratedEmail(generated);
      toast.success("Email generated!");
    } catch (err) {
      console.error("Error generating email:", err);
      toast.error("Failed to generate email");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const baseTemplate = emailTemplates[selectedType](variables);

      const prompt = `Improve this email for a ${variables.eventType} business. Make it more engaging and professional while keeping the same information. Customer name: ${variables.customerName}. Here's the template:\n\n${baseTemplate}`;

      const variations = [
        baseTemplate.replace(/Dear/g, 'Hello').replace(/Best regards/g, 'Cheers'),
        baseTemplate.replace(/We hope/g, 'Hope').replace(/Thank you/g, 'Thanks so much'),
        baseTemplate.replace(/Dear/g, 'Hi').replace(/Best regards/g, 'Warmly'),
      ];

      const randomVariation = variations[Math.floor(Math.random() * variations.length)];
      setGeneratedEmail(randomVariation);
      toast.success("Email regenerated with variations!");
    } catch (err) {
      toast.error("Failed to regenerate");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTemplate = async () => {
    if (!generatedEmail) return;

    try {
      const { error } = await supabase.from("ai_generated_content").insert({
        content_type: "email_template",
        title: `${emailTypeConfig[selectedType].label} - ${variables.customerName || 'Template'}`,
        content: generatedEmail,
        prompt_used: JSON.stringify({ type: selectedType, variables }),
        metadata: { emailType: selectedType, variables },
        status: "draft"
      });

      if (error) throw error;
      toast.success("Template saved!");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    toast.success("Copied to clipboard!");
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await supabase.from("ai_generated_content").delete().eq("id", id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const useTemplate = (template: EmailTemplate) => {
    setGeneratedEmail(template.content);
    if (template.metadata?.emailType) {
      setSelectedType(template.metadata.emailType);
    }
    if (template.metadata?.variables) {
      setVariables(template.metadata.variables);
    }
    setIsComposeOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Email Templates
          </h2>
          <p className="text-muted-foreground">Generate professional emails with AI assistance</p>
        </div>
        <Button onClick={() => { setGeneratedEmail(""); setIsComposeOpen(true); }}>
          <Mail className="h-4 w-4 mr-2" />
          Compose Email
        </Button>
      </div>

      {/* Quick Generate Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(emailTypeConfig) as [EmailType, typeof emailTypeConfig[EmailType]][]).slice(0, 4).map(([type, config]) => (
          <Card key={type} className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => { setSelectedType(type); setGeneratedEmail(""); setIsComposeOpen(true); }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{config.label}</CardTitle>
              <CardDescription className="text-xs">{config.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Saved Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Templates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No saved templates yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {emailTypeConfig[template.metadata?.emailType as EmailType]?.label || 'Email'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={template.status === 'approved' ? 'bg-green-500' : 'bg-gray-500'}>
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(template.created_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => useTemplate(template)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                          navigator.clipboard.writeText(template.content);
                          toast.success("Copied!");
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Compose Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Email Composer
            </DialogTitle>
          </DialogHeader>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Variables Panel */}
            <div className="space-y-4">
              <div>
                <Label>Email Type</Label>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EmailType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(emailTypeConfig).map(([type, config]) => (
                      <SelectItem key={type} value={type}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Customer Name</Label>
                  <Input
                    value={variables.customerName}
                    onChange={(e) => setVariables({ ...variables, customerName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label>Order Number</Label>
                  <Input
                    value={variables.orderNumber}
                    onChange={(e) => setVariables({ ...variables, orderNumber: e.target.value })}
                    placeholder="VL-12345"
                  />
                </div>
                <div>
                  <Label>Event Type</Label>
                  <Input
                    value={variables.eventType}
                    onChange={(e) => setVariables({ ...variables, eventType: e.target.value })}
                    placeholder="Wedding"
                  />
                </div>
                <div>
                  <Label>Package</Label>
                  <Input
                    value={variables.packageName}
                    onChange={(e) => setVariables({ ...variables, packageName: e.target.value })}
                    placeholder="Premium Package"
                  />
                </div>
                <div>
                  <Label>Event Date</Label>
                  <Input
                    type="date"
                    value={variables.eventDate}
                    onChange={(e) => setVariables({ ...variables, eventDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Total Price</Label>
                  <Input
                    value={variables.totalPrice}
                    onChange={(e) => setVariables({ ...variables, totalPrice: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div>
                  <Label>Amount Due</Label>
                  <Input
                    value={variables.amountDue}
                    onChange={(e) => setVariables({ ...variables, amountDue: e.target.value })}
                    placeholder="250"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={variables.dueDate}
                    onChange={(e) => setVariables({ ...variables, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={generateEmail} disabled={isGenerating} className="flex-1">
                  {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
                {generatedEmail && (
                  <Button variant="outline" onClick={regenerateWithAI} disabled={isGenerating}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <Label>Email Preview</Label>
              <Textarea
                value={generatedEmail}
                onChange={(e) => setGeneratedEmail(e.target.value)}
                placeholder="Generated email will appear here..."
                className="min-h-[400px] font-mono text-sm"
              />

              {generatedEmail && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={saveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIEmailTemplates;

