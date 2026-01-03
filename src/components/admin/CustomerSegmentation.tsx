import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Users, Plus, Edit2, Trash2, Target, TrendingUp, DollarSign, Download, RefreshCw, Search, Crown, Star, UserCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

interface Segment {
  id: string;
  name: string;
  description: string;
  criteria: { min_orders?: number; max_orders?: number; min_total_spent?: number; max_total_spent?: number; last_order_days?: number };
  customer_count: number;
  total_revenue: number;
  color: string;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  last_order_date: string;
  segments: string[];
}

const defaultSegments: Segment[] = [
  { id: "vip", name: "VIP Customers", description: "High-value customers with 5+ orders and GHS 1000+ spent", criteria: { min_orders: 5, min_total_spent: 1000 }, customer_count: 0, total_revenue: 0, color: "gold" },
  { id: "loyal", name: "Loyal Customers", description: "Regular customers with 3+ orders in last 90 days", criteria: { min_orders: 3, last_order_days: 90 }, customer_count: 0, total_revenue: 0, color: "purple" },
  { id: "at-risk", name: "At Risk", description: "Customers inactive for 60+ days", criteria: { last_order_days: 60 }, customer_count: 0, total_revenue: 0, color: "red" },
  { id: "new", name: "New Customers", description: "First order in last 30 days", criteria: { max_orders: 1, last_order_days: 30 }, customer_count: 0, total_revenue: 0, color: "green" },
];

const segmentColors: Record<string, string> = {
  gold: "bg-amber-100 text-amber-800 border-amber-300",
  purple: "bg-purple-100 text-purple-800 border-purple-300",
  red: "bg-red-100 text-red-800 border-red-300",
  green: "bg-green-100 text-green-800 border-green-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
};

export const CustomerSegmentation = () => {
  const [segments, setSegments] = useState<Segment[]>(defaultSegments);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({ name: "", description: "", color: "blue", min_orders: "", max_orders: "", min_total_spent: "", max_total_spent: "", last_order_days: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      const customerMap = new Map<string, Customer>();
      orders?.forEach((order) => {
        const email = order.customer_email;
        if (!email) return;
        if (!customerMap.has(email)) {
          customerMap.set(email, { id: email, email, name: order.customer_name || "Unknown", phone: order.customer_phone || "", total_orders: 0, total_spent: 0, last_order_date: order.created_at, segments: [] });
        }
        const customer = customerMap.get(email)!;
        customer.total_orders += 1;
        customer.total_spent += order.total_amount || 0;
        if (new Date(order.created_at) > new Date(customer.last_order_date)) customer.last_order_date = order.created_at;
      });
      const customerList = Array.from(customerMap.values());
      const updatedSegments = segments.map((segment) => {
        const matching = customerList.filter((c) => matchesCriteria(c, segment.criteria, segment.id));
        return { ...segment, customer_count: matching.length, total_revenue: matching.reduce((sum, c) => sum + c.total_spent, 0) };
      });
      customerList.forEach((customer) => {
        customer.segments = updatedSegments.filter((s) => matchesCriteria(customer, s.criteria, s.id)).map((s) => s.id);
      });
      setCustomers(customerList);
      setSegments(updatedSegments);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const matchesCriteria = (customer: Customer, criteria: Segment["criteria"], segmentId: string): boolean => {
    const days = Math.floor((Date.now() - new Date(customer.last_order_date).getTime()) / 86400000);
    if (criteria.min_orders && customer.total_orders < criteria.min_orders) return false;
    if (criteria.max_orders && customer.total_orders > criteria.max_orders) return false;
    if (criteria.min_total_spent && customer.total_spent < criteria.min_total_spent) return false;
    if (criteria.max_total_spent && customer.total_spent > criteria.max_total_spent) return false;
    if (criteria.last_order_days) {
      if (segmentId === "at-risk") return days >= criteria.last_order_days;
      return days <= criteria.last_order_days;
    }
    return true;
  };

  const handleCreate = () => {
    const criteria: Segment["criteria"] = {};
    if (formData.min_orders) criteria.min_orders = parseInt(formData.min_orders);
    if (formData.max_orders) criteria.max_orders = parseInt(formData.max_orders);
    if (formData.min_total_spent) criteria.min_total_spent = parseFloat(formData.min_total_spent);
    if (formData.max_total_spent) criteria.max_total_spent = parseFloat(formData.max_total_spent);
    if (formData.last_order_days) criteria.last_order_days = parseInt(formData.last_order_days);
    const newSeg: Segment = { id: formData.name.toLowerCase().replace(/\s+/g, "-"), name: formData.name, description: formData.description, criteria, customer_count: 0, total_revenue: 0, color: formData.color };
    const matching = customers.filter((c) => matchesCriteria(c, criteria, newSeg.id));
    newSeg.customer_count = matching.length;
    newSeg.total_revenue = matching.reduce((sum, c) => sum + c.total_spent, 0);
    setSegments([...segments, newSeg]);
    setShowCreateDialog(false);
    setFormData({ name: "", description: "", color: "blue", min_orders: "", max_orders: "", min_total_spent: "", max_total_spent: "", last_order_days: "" });
    toast.success("Segment created");
  };

  const exportSegment = (segment: Segment) => {
    const matching = customers.filter((c) => matchesCriteria(c, segment.criteria, segment.id));
    const csv = [["Email", "Name", "Phone", "Orders", "Spent", "Last Order"], ...matching.map((c) => [c.email, c.name, c.phone, c.total_orders, c.total_spent.toFixed(2), format(new Date(c.last_order_date), "yyyy-MM-dd")])].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${segment.id}-customers.csv`;
    a.click();
    toast.success(`Exported ${matching.length} customers`);
  };

  const filteredCustomers = customers.filter((c) => !selectedSegment || matchesCriteria(c, selectedSegment.criteria, selectedSegment.id)).filter((c) => c.email.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalRevenue = customers.reduce((sum, c) => sum + c.total_spent, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6 text-indigo-600" />Customer Segmentation</h2>
          <p className="text-gray-600 mt-1">Organize customers by behavior and value</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}><RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild><Button className="bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4 mr-2" />Create Segment</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Segment</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Premium Buyers" /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} /></div>
                <div><Label>Color</Label><Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.keys(segmentColors).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">Min Orders</Label><Input type="number" value={formData.min_orders} onChange={(e) => setFormData({ ...formData, min_orders: e.target.value })} /></div>
                  <div><Label className="text-xs">Max Orders</Label><Input type="number" value={formData.max_orders} onChange={(e) => setFormData({ ...formData, max_orders: e.target.value })} /></div>
                  <div><Label className="text-xs">Min Spent (GHS)</Label><Input type="number" value={formData.min_total_spent} onChange={(e) => setFormData({ ...formData, min_total_spent: e.target.value })} /></div>
                  <div><Label className="text-xs">Max Spent (GHS)</Label><Input type="number" value={formData.max_total_spent} onChange={(e) => setFormData({ ...formData, max_total_spent: e.target.value })} /></div>
                  <div className="col-span-2"><Label className="text-xs">Days Since Last Order</Label><Input type="number" value={formData.last_order_days} onChange={(e) => setFormData({ ...formData, last_order_days: e.target.value })} /></div>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Customers</p><p className="text-2xl font-bold">{customers.length}</p></div><Users className="h-8 w-8 text-indigo-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Segments</p><p className="text-2xl font-bold">{segments.length}</p></div><Target className="h-8 w-8 text-purple-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold">GHS {totalRevenue.toFixed(2)}</p></div><DollarSign className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-500">VIP Customers</p><p className="text-2xl font-bold">{segments.find((s) => s.id === "vip")?.customer_count || 0}</p></div><Crown className="h-8 w-8 text-amber-600" /></div></CardContent></Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="overview">Segments</TabsTrigger><TabsTrigger value="customers">{selectedSegment ? selectedSegment.name : "All Customers"}</TabsTrigger></TabsList>
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {segments.map((seg) => (
              <Card key={seg.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${segmentColors[seg.color]?.split(" ")[0] || "bg-blue-100"}`} />
                <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-lg">{seg.name}</CardTitle></div><CardDescription className="text-xs">{seg.description}</CardDescription></CardHeader>
                <CardContent><div className="space-y-3"><div className="flex justify-between text-sm"><span className="text-gray-500">Customers</span><span className="font-semibold">{seg.customer_count}</span></div><div className="flex justify-between text-sm"><span className="text-gray-500">Revenue</span><span className="font-semibold">GHS {seg.total_revenue.toFixed(2)}</span></div><Progress value={(seg.customer_count / Math.max(customers.length, 1)) * 100} className="h-2" /><div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedSegment(seg); setActiveTab("customers"); }}>View</Button><Button variant="outline" size="sm" onClick={() => exportSegment(seg)}><Download className="h-4 w-4" /></Button></div></div></CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="customers">
          <Card>
            <CardHeader><div className="flex items-center justify-between"><div><CardTitle>{selectedSegment ? selectedSegment.name : "All Customers"}</CardTitle><CardDescription>{filteredCustomers.length} customers</CardDescription></div><div className="flex gap-2">{selectedSegment && <Button variant="outline" onClick={() => setSelectedSegment(null)}>View All</Button>}<div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-64" /></div></div></div></CardHeader>
            <CardContent><ScrollArea className="h-[400px]"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Orders</TableHead><TableHead>Spent</TableHead><TableHead>Last Order</TableHead><TableHead>Segments</TableHead></TableRow></TableHeader><TableBody>{filteredCustomers.map((c) => (<TableRow key={c.id}><TableCell><div><p className="font-medium">{c.name}</p><p className="text-sm text-gray-500">{c.email}</p></div></TableCell><TableCell>{c.total_orders}</TableCell><TableCell>GHS {c.total_spent.toFixed(2)}</TableCell><TableCell>{format(new Date(c.last_order_date), "MMM d, yyyy")}</TableCell><TableCell><div className="flex flex-wrap gap-1">{c.segments.map((sid) => { const s = segments.find((x) => x.id === sid); return s ? <Badge key={sid} variant="outline" className={`text-xs ${segmentColors[s.color]}`}>{s.name}</Badge> : null; })}</div></TableCell></TableRow>))}{filteredCustomers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No customers found</TableCell></TableRow>}</TableBody></Table></ScrollArea></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

