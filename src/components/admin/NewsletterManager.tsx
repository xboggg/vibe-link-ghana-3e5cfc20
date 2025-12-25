import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Trash2, Search, Mail, Users, Download, ToggleLeft, ToggleRight, Send, Loader2, Paperclip, X, FileText, Megaphone, Gift, CalendarDays, Clock } from "lucide-react";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { RichTextEditor } from "./RichTextEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EmailTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  subject: string;
  content: string;
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    icon: <FileText className="h-4 w-4" />,
    subject: "",
    content: "",
  },
  {
    id: "announcement",
    name: "Announcement",
    icon: <Megaphone className="h-4 w-4" />,
    subject: "Exciting News from VibeLink Ghana!",
    content: `<h2>Big News! 🎉</h2>
<p>Dear Valued Subscriber,</p>
<p>We have some exciting news to share with you!</p>
<p>[Your announcement here]</p>
<p>We're thrilled to bring you this update and can't wait for you to experience what's coming.</p>
<p>Stay tuned for more updates!</p>
<p>Best regards,<br/>The VibeLink Ghana Team</p>`,
  },
  {
    id: "promotion",
    name: "Promotion",
    icon: <Gift className="h-4 w-4" />,
    subject: "Special Offer Just for You! 🎁",
    content: `<h2>Exclusive Offer! 🎁</h2>
<p>Dear Subscriber,</p>
<p>We have a special promotion that we think you'll love!</p>
<h3>Limited Time Offer</h3>
<p><strong>[Describe your promotion here]</strong></p>
<ul>
<li>Discount: [X]% OFF</li>
<li>Valid until: [Date]</li>
<li>Use code: [PROMO_CODE]</li>
</ul>
<p>Don't miss out on this amazing opportunity!</p>
<p><a href="#">Shop Now</a></p>
<p>Best regards,<br/>The VibeLink Ghana Team</p>`,
  },
  {
    id: "event-update",
    name: "Event Update",
    icon: <CalendarDays className="h-4 w-4" />,
    subject: "Upcoming Event You Won't Want to Miss! 📅",
    content: `<h2>You're Invited! 📅</h2>
<p>Dear Subscriber,</p>
<p>We're excited to announce an upcoming event!</p>
<h3>Event Details</h3>
<ul>
<li><strong>What:</strong> [Event Name]</li>
<li><strong>When:</strong> [Date & Time]</li>
<li><strong>Where:</strong> [Location/Virtual Link]</li>
</ul>
<p>[Additional event description]</p>
<p>We'd love to see you there!</p>
<p><a href="#">Register Now</a></p>
<p>Best regards,<br/>The VibeLink Ghana Team</p>`,
  },
  {
    id: "newsletter",
    name: "Monthly Newsletter",
    icon: <Mail className="h-4 w-4" />,
    subject: "Your Monthly Update from VibeLink Ghana 📬",
    content: `<h2>Monthly Newsletter 📬</h2>
<p>Dear Subscriber,</p>
<p>Here's what's been happening at VibeLink Ghana this month!</p>
<h3>Highlights</h3>
<ul>
<li>[Highlight 1]</li>
<li>[Highlight 2]</li>
<li>[Highlight 3]</li>
</ul>
<h3>Featured Work</h3>
<p>[Describe recent projects or achievements]</p>
<h3>What's Coming</h3>
<p>[Tease upcoming features or events]</p>
<p>Thank you for being part of our community!</p>
<p>Best regards,<br/>The VibeLink Ghana Team</p>`,
  },
];

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  source: string | null;
}

const TOPIC_OPTIONS = [
  { value: "", label: "All Subscribers", description: "Send to everyone" },
  { value: "announcements", label: "Announcements", description: "Subscribers interested in news & updates" },
  { value: "promotions", label: "Promotions", description: "Subscribers interested in deals & offers" },
  { value: "events", label: "Event Tips", description: "Subscribers interested in event ideas" },
  { value: "showcase", label: "Work Showcase", description: "Subscribers interested in your work" },
];

export function NewsletterManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledHour, setScheduledHour] = useState("09");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const queryClient = useQueryClient();

  const handleTemplateChange = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setSubject(template.subject);
      setContent(template.content);
    }
  };

  const resetForm = () => {
    setSubject("");
    setContent("");
    setAttachments([]);
    setSelectedTemplate("blank");
    setSelectedTopic("");
    setScheduleEnabled(false);
    setScheduledDate(undefined);
    setScheduledHour("09");
    setScheduledMinute("00");
  };

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });
      
      if (error) throw error;
      return data as Subscriber[];
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success("Subscriber status updated");
    },
    onError: () => {
      toast.error("Failed to update subscriber");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success("Subscriber deleted");
    },
    onError: () => {
      toast.error("Failed to delete subscriber");
    }
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: { 
          subject, 
          content,
          topic: selectedTopic || undefined
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Newsletter sent successfully!");
      setComposeOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send newsletter");
    }
  });

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.is_active).length;

  const exportToCSV = () => {
    const headers = ['Email', 'Subscribed Date', 'Status', 'Source'];
    const rows = subscribers.map(s => [
      s.email,
      format(new Date(s.subscribed_at), 'yyyy-MM-dd HH:mm'),
      s.is_active ? 'Active' : 'Inactive',
      s.source || 'Unknown'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported to CSV");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // Limit total attachments to 5 and max 5MB each
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Max 5MB per file.`);
          return false;
        }
        return true;
      });
      
      if (attachments.length + validFiles.length > 5) {
        toast.error("Maximum 5 attachments allowed");
        return;
      }
      
      setAttachments(prev => [...prev, ...validFiles]);
    }
    e.target.value = ''; // Reset input
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Newsletter Subscribers</h2>
          <p className="text-muted-foreground">Manage your newsletter subscriber list</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={activeCount === 0}>
                <Send className="h-4 w-4" />
                Send Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Compose Newsletter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Template Selector */}
                <div className="space-y-2">
                  <Label>Choose a Template</Label>
                  <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMAIL_TEMPLATES.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex items-center gap-2">
                            {template.icon}
                            <span>{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a template to start with pre-filled content, or choose "Blank" to start fresh.
                  </p>
                </div>

                {/* Target Audience */}
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Send to all subscribers..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TOPIC_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Filter recipients by their topic preferences. Subscribers without preferences will receive all newsletters.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter newsletter subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Content</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Use the toolbar for formatting: bold, italic, headings, lists, links, images, and more.
                  </p>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                  />
                </div>

                {/* Attachments Section */}
                <div className="space-y-2">
                  <Label>Attachments</Label>
                  <div className="border border-dashed border-border rounded-lg p-4">
                    <input
                      type="file"
                      id="attachments"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
                    />
                    <label
                      htmlFor="attachments"
                      className="flex flex-col items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Paperclip className="h-8 w-8" />
                      <span className="text-sm">Click to attach files</span>
                      <span className="text-xs">PDF, DOC, XLS, Images (Max 5MB each, up to 5 files)</span>
                    </label>
                  </div>

                  {/* Attached Files List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Paperclip className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({formatFileSize(file.size)})
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Note: Attachments will be included in the email. Large files may affect delivery.
                  </p>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Label>Schedule for later</Label>
                    </div>
                    <Switch
                      checked={scheduleEnabled}
                      onCheckedChange={setScheduleEnabled}
                    />
                  </div>

                  {scheduleEnabled && (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("justify-start text-left font-normal flex-1", !scheduledDate && "text-muted-foreground")}>
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                      </Popover>
                      <div className="flex gap-2">
                        <Select value={scheduledHour} onValueChange={setScheduledHour}>
                          <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={i.toString().padStart(2, "0")}>{i.toString().padStart(2, "0")}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="flex items-center">:</span>
                        <Select value={scheduledMinute} onValueChange={setScheduledMinute}>
                          <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((m) => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {scheduleEnabled && scheduledDate 
                      ? `Scheduled for ${format(scheduledDate, "MMM d")} at ${scheduledHour}:${scheduledMinute}`
                      : `Will be sent to ${activeCount} active subscriber${activeCount !== 1 ? "s" : ""}`
                    }
                  </p>
                  <Button 
                    onClick={() => sendNewsletterMutation.mutate()}
                    disabled={!subject || !content || sendNewsletterMutation.isPending || (scheduleEnabled && !scheduledDate)}
                    className="gap-2"
                  >
                    {sendNewsletterMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {scheduleEnabled ? "Scheduling..." : "Sending..."}
                      </>
                    ) : (
                      <>
                        {scheduleEnabled ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        {scheduleEnabled ? "Schedule" : "Send Now"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {subscribers.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-green-500" />
              {activeCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Inactive Subscribers</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Mail className="h-6 w-6 text-muted-foreground" />
              {subscribers.length - activeCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading subscribers...</div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? "No subscribers match your search" : "No subscribers yet"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>{format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {subscriber.source || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                        {subscriber.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleActiveMutation.mutate({ 
                            id: subscriber.id, 
                            is_active: !subscriber.is_active 
                          })}
                          title={subscriber.is_active ? "Deactivate" : "Activate"}
                        >
                          {subscriber.is_active ? (
                            <ToggleRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this subscriber?")) {
                              deleteMutation.mutate(subscriber.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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
    </div>
  );
}
