import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Plus, Edit2, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, FileText, Hash, Target, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContentItem {
  id: string;
  title: string;
  description: string;
  content_type: "blog" | "social" | "email" | "video";
  status: "draft" | "scheduled" | "published" | "archived";
  scheduled_date: string;
  keywords: string[];
  target_audience: string;
  created_at: string;
  author: string;
}

const contentTypes = [
  { value: "blog", label: "Blog Post", color: "bg-blue-100 text-blue-800" },
  { value: "social", label: "Social Media", color: "bg-pink-100 text-pink-800" },
  { value: "email", label: "Email Campaign", color: "bg-green-100 text-green-800" },
  { value: "video", label: "Video", color: "bg-purple-100 text-purple-800" },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-yellow-100 text-yellow-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-red-100 text-red-800",
};

export const SEOContentCalendar = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [formData, setFormData] = useState({ title: "", description: "", content_type: "blog" as const, status: "draft" as const, scheduled_date: "", keywords: "", target_audience: "" });

  useEffect(() => {
    const stored = localStorage.getItem("seo_content_calendar");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const saveItems = (newItems: ContentItem[]) => {
    setItems(newItems);
    localStorage.setItem("seo_content_calendar", JSON.stringify(newItems));
  };

  const handleCreate = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      content_type: formData.content_type,
      status: formData.status,
      scheduled_date: formData.scheduled_date || new Date().toISOString(),
      keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      target_audience: formData.target_audience,
      created_at: new Date().toISOString(),
      author: "Admin",
    };
    saveItems([...items, newItem]);
    setShowCreateDialog(false);
    resetForm();
    toast.success("Content scheduled");
  };

  const handleEdit = () => {
    if (!editingItem) return;
    const updated: ContentItem = {
      ...editingItem,
      title: formData.title,
      description: formData.description,
      content_type: formData.content_type,
      status: formData.status,
      scheduled_date: formData.scheduled_date,
      keywords: formData.keywords.split(",").map((k) => k.trim()).filter(Boolean),
      target_audience: formData.target_audience,
    };
    saveItems(items.map((i) => (i.id === editingItem.id ? updated : i)));
    setShowEditDialog(false);
    setEditingItem(null);
    resetForm();
    toast.success("Content updated");
  };

  const handleDelete = (id: string) => {
    saveItems(items.filter((i) => i.id !== id));
    toast.success("Content deleted");
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", content_type: "blog", status: "draft", scheduled_date: "", keywords: "", target_audience: "" });
  };

  const openEdit = (item: ContentItem) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description, content_type: item.content_type, status: item.status, scheduled_date: item.scheduled_date.split("T")[0], keywords: item.keywords.join(", "), target_audience: item.target_audience });
    setShowEditDialog(true);
  };

  const openCreateForDate = (date: Date) => {
    setFormData({ ...formData, scheduled_date: format(date, "yyyy-MM-dd") });
    setShowCreateDialog(true);
  };

  const getItemsForDate = (date: Date) => items.filter((i) => isSameDay(new Date(i.scheduled_date), date));

  const filteredItems = items.filter((i) => {
    if (filterType !== "all" && i.content_type !== filterType) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (searchTerm && !i.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const stats = {
    total: items.length,
    draft: items.filter((i) => i.status === "draft").length,
    scheduled: items.filter((i) => i.status === "scheduled").length,
    published: items.filter((i) => i.status === "published").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6 text-indigo-600" />SEO Content Calendar</h2>
          <p className="text-gray-600 mt-1">Plan and schedule your content strategy</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Add Content</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Schedule Content</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Content title" /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Type</Label><Select value={formData.content_type} onValueChange={(v: any) => setFormData({ ...formData, content_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                  <div><Label>Status</Label><Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select></div>
                </div>
                <div><Label>Scheduled Date</Label><Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} /></div>
                <div><Label>Keywords (comma-separated)</Label><Input value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} placeholder="seo, marketing, ghana" /></div>
                <div><Label>Target Audience</Label><Input value={formData.target_audience} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} placeholder="Small business owners" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.title}>Schedule</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Content</p><p className="text-2xl font-bold">{stats.total}</p></div><FileText className="h-8 w-8 text-indigo-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Drafts</p><p className="text-2xl font-bold">{stats.draft}</p></div><Edit2 className="h-8 w-8 text-gray-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Scheduled</p><p className="text-2xl font-bold">{stats.scheduled}</p></div><Clock className="h-8 w-8 text-yellow-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Published</p><p className="text-2xl font-bold">{stats.published}</p></div><CheckCircle className="h-8 w-8 text-green-600" /></div></CardContent></Card>
      </div>

      <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList><TabsTrigger value="month">Month</TabsTrigger><TabsTrigger value="week">Week</TabsTrigger><TabsTrigger value="list">List</TabsTrigger></TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, viewMode === "week" ? -7 : -30))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="font-medium min-w-[150px] text-center">{format(currentDate, viewMode === "week" ? "MMM d, yyyy" : "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, viewMode === "week" ? 7 : 30))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <TabsContent value="month">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>)}
                {calendarDays.map((day) => {
                  const dayItems = getItemsForDate(day);
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                  return (
                    <div key={day.toISOString()} className={`min-h-[100px] border rounded p-1 ${isCurrentMonth ? "bg-white" : "bg-gray-50"} ${isSameDay(day, new Date()) ? "border-indigo-500" : "border-gray-200"}`} onClick={() => openCreateForDate(day)}>
                      <div className="text-xs font-medium text-gray-500 mb-1">{format(day, "d")}</div>
                      <div className="space-y-1">
                        {dayItems.slice(0, 3).map((item) => {
                          const type = contentTypes.find((t) => t.value === item.content_type);
                          return <div key={item.id} className={`text-xs p-1 rounded truncate cursor-pointer ${type?.color}`} onClick={(e) => { e.stopPropagation(); openEdit(item); }}>{item.title}</div>;
                        })}
                        {dayItems.length > 3 && <div className="text-xs text-gray-500">+{dayItems.length - 3} more</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => {
                  const dayItems = getItemsForDate(day);
                  return (
                    <div key={day.toISOString()} className={`min-h-[300px] border rounded p-2 ${isSameDay(day, new Date()) ? "border-indigo-500 bg-indigo-50" : "border-gray-200"}`}>
                      <div className="text-center mb-2"><div className="text-xs text-gray-500">{format(day, "EEE")}</div><div className="text-lg font-bold">{format(day, "d")}</div></div>
                      <Button variant="ghost" size="sm" className="w-full mb-2" onClick={() => openCreateForDate(day)}><Plus className="h-3 w-3" /></Button>
                      <div className="space-y-2">
                        {dayItems.map((item) => {
                          const type = contentTypes.find((t) => t.value === item.content_type);
                          return (
                            <div key={item.id} className={`p-2 rounded text-xs cursor-pointer ${type?.color}`} onClick={() => openEdit(item)}>
                              <div className="font-medium truncate">{item.title}</div>
                              <Badge variant="outline" className={`mt-1 text-xs ${statusColors[item.status]}`}>{item.status}</Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Content</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{contentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}><SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select>
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-48" /></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredItems.sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()).map((item) => {
                    const type = contentTypes.find((t) => t.value === item.content_type);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded ${type?.color}`}><FileText className="h-5 w-5" /></div>
                          <div>
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className={type?.color}>{type?.label}</Badge>
                              <Badge variant="outline" className={statusColors[item.status]}>{item.status}</Badge>
                              <span className="text-xs text-gray-500">{format(new Date(item.scheduled_date), "MMM d, yyyy")}</span>
                            </div>
                            {item.keywords.length > 0 && <div className="flex gap-1 mt-1">{item.keywords.slice(0, 3).map((k) => <Badge key={k} variant="secondary" className="text-xs"><Hash className="h-3 w-3 mr-1" />{k}</Badge>)}</div>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredItems.length === 0 && <div className="text-center py-12 text-gray-500">No content found. Click "Add Content" to get started.</div>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Content</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type</Label><Select value={formData.content_type} onValueChange={(v: any) => setFormData({ ...formData, content_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{contentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Status</Label><Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
            </div>
            <div><Label>Scheduled Date</Label><Input type="date" value={formData.scheduled_date} onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })} /></div>
            <div><Label>Keywords</Label><Input value={formData.keywords} onChange={(e) => setFormData({ ...formData, keywords: e.target.value })} /></div>
            <div><Label>Target Audience</Label><Input value={formData.target_audience} onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button><Button onClick={handleEdit}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

