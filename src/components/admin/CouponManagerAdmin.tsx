import { useState, useEffect } from "react";
import { Tag, Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, Gift, Hash, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  description: string | null;
  usage_limit: number | null;
  times_used: number | null;
  valid_until: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

interface CouponFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount: number;
  usage_limit: number;
  valid_until: string;
  description: string;
}

const defaultFormData: CouponFormData = {
  code: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_amount: 0,
  max_discount: 0,
  usage_limit: 0,
  valid_until: "",
  description: ""
};

export function CouponManagerAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code, 
        discount_type: (coupon.discount_type === "percentage" || coupon.discount_type === "fixed") ? coupon.discount_type : "percentage", 
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount || 0, 
        max_discount: coupon.max_discount || 0,
        usage_limit: coupon.usage_limit || 0,
        valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
        description: coupon.description || ""
      });
    } else {
      setEditingCoupon(null);
      setFormData(defaultFormData);
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.discount_value) { toast.error("Please fill in required fields"); return; }
    setIsSubmitting(true);
    try {
      const couponData = {
        code: formData.code.toUpperCase(), discount_type: formData.discount_type, discount_value: formData.discount_value,
        min_order_amount: formData.min_order_amount || null, max_discount: formData.max_discount || null,
        usage_limit: formData.usage_limit || null, valid_until: formData.valid_until || null,
        description: formData.description || null, is_active: true
      };
      if (editingCoupon) {
        const { error } = await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id);
        if (error) throw error;
        toast.success("Coupon updated!");
      } else {
        const { error } = await supabase.from("coupons").insert({ ...couponData, times_used: 0 });
        if (error) throw error;
        toast.success("Coupon created!");
      }
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (err: any) {
      console.error("Error saving coupon:", err);
      toast.error(err.code === "23505" ? "A coupon with this code already exists" : "Failed to save coupon");
    } finally { setIsSubmitting(false); }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const { error } = await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id);
      if (error) throw error;
      toast.success(coupon.is_active ? "Coupon deactivated" : "Coupon activated");
      fetchCoupons();
    } catch (err) { console.error("Error toggling coupon:", err); toast.error("Failed to update coupon"); }
  };

  const deleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", couponId);
      if (error) throw error;
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) { console.error("Error deleting coupon:", err); toast.error("Failed to delete coupon"); }
  };

  const getStatusBadge = (coupon: Coupon) => {
    if (!coupon.is_active) return <Badge variant="secondary">Inactive</Badge>;
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) return <Badge variant="destructive">Expired</Badge>;
    if (coupon.usage_limit && (coupon.times_used || 0) >= coupon.usage_limit) return <Badge variant="outline">Limit Reached</Badge>;
    return <Badge className="bg-green-500">Active</Badge>;
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUsage = coupons.reduce((sum, c) => sum + (c.times_used || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold">Coupon Management</h2><p className="text-muted-foreground">Create and manage discount codes</p></div>
        <Button variant="outline" onClick={fetchCoupons}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Coupons</p><p className="text-2xl font-bold">{totalCoupons}</p></div><Tag className="h-8 w-8 text-primary/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Active Coupons</p><p className="text-2xl font-bold text-green-600">{activeCoupons}</p></div><CheckCircle className="h-8 w-8 text-green-500/50" /></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Uses</p><p className="text-2xl font-bold">{totalUsage}</p></div><Hash className="h-8 w-8 text-blue-500/50" /></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Coupons</CardTitle><CardDescription>Manage discount codes and promotions</CardDescription></div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild><Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Coupon</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle><DialogDescription>{editingCoupon ? "Update the coupon details" : "Create a new discount coupon"}</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label htmlFor="code">Coupon Code *</Label><Input id="code" placeholder="e.g., WELCOME10" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="uppercase" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Discount Type</Label><Select value={formData.discount_type} onValueChange={(v) => setFormData({ ...formData, discount_type: v as "percentage" | "fixed" })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed">Fixed Amount (GHS)</SelectItem></SelectContent></Select></div>
                  <div className="grid gap-2"><Label htmlFor="value">Discount Value *</Label><Input id="value" type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })} min={0} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="min">Min Order Amount</Label><Input id="min" type="number" placeholder="0" value={formData.min_order_amount || ""} onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })} min={0} /></div>
                  <div className="grid gap-2"><Label htmlFor="max">Max Discount</Label><Input id="max" type="number" placeholder="No limit" value={formData.max_discount || ""} onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })} min={0} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label htmlFor="limit">Usage Limit</Label><Input id="limit" type="number" placeholder="Unlimited" value={formData.usage_limit || ""} onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })} min={0} /></div>
                  <div className="grid gap-2"><Label htmlFor="expiry">Valid Until</Label><Input id="expiry" type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} /></div>
                </div>
                <div className="grid gap-2"><Label htmlFor="desc">Description</Label><Input id="desc" placeholder="e.g., Welcome discount for new customers" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editingCoupon ? "Update" : "Create"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12"><Gift className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No coupons yet</p><p className="text-sm text-muted-foreground">Create your first coupon to get started</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Uses</TableHead><TableHead>Status</TableHead><TableHead>Expires</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell><div className="flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /><span className="font-mono font-bold">{coupon.code}</span></div>{coupon.description && <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>}</TableCell>
                    <TableCell><span className="font-medium">{coupon.discount_type === "percentage" ? coupon.discount_value + "%" : "GHS " + coupon.discount_value}</span>{coupon.min_order_amount && <p className="text-xs text-muted-foreground">Min: GHS {coupon.min_order_amount}</p>}</TableCell>
                    <TableCell><span className="font-medium">{coupon.times_used || 0}</span>{coupon.usage_limit && <span className="text-muted-foreground">/{coupon.usage_limit}</span>}</TableCell>
                    <TableCell>{getStatusBadge(coupon)}</TableCell>
                    <TableCell>{coupon.valid_until ? format(new Date(coupon.valid_until), "MMM d, yyyy") : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleCouponStatus(coupon)} title={coupon.is_active ? "Deactivate" : "Activate"}>{coupon.is_active ? <XCircle className="h-4 w-4 text-orange-500" /> : <CheckCircle className="h-4 w-4 text-green-500" />}</Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)}><Edit2 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteCoupon(coupon.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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

export default CouponManagerAdmin;
