import { useState, useEffect } from "react";
import {
  Plus, Copy, Edit, Trash2, Search, FilePlus2,
  Loader2, Package, Users, Calendar, DollarSign, Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface OrderTemplate {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  package_name: string;
  base_price: number | null;
  default_options: any;
  customer_email: string | null;
  customer_name: string | null;
  usage_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Funeral",
  "Anniversary",
  "Graduation",
  "Baby Shower",
  "Engagement",
  "Other"
];

const packageOptions = [
  "Basic Package",
  "Standard Package",
  "Premium Package",
  "Custom Package"
];

export function OrderTemplates() {
  const [templates, setTemplates] = useState<OrderTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OrderTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    event_type: "",
    package_name: "",
    base_price: 0,
    customer_name: "",
    customer_email: "",
    is_active: true,
    default_options: {
      include_delivery: true,
      rush_order: false,
      special_requests: ""
    }
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_templates")
        .select("*")
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error("Error fetching templates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async () => {
    if (!formData.name || !formData.event_type || !formData.package_name) {
      toast.error("Please fill required fields");
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        name: formData.name,
        description: formData.description || null,
        event_type: formData.event_type,
        package_name: formData.package_name,
        base_price: formData.base_price || null,
        customer_name: formData.customer_name || null,
        customer_email: formData.customer_email || null,
        is_active: formData.is_active,
        default_options: formData.default_options,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("order_templates")
          .update(templateData)
          .eq("id", editingTemplate.id);
        if (error) throw error;
        toast.success("Template updated");
      } else {
        const { error } = await supabase
          .from("order_templates")
          .insert(templateData);
        if (error) throw error;
        toast.success("Template created");
      }

      setIsCreateOpen(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await supabase.from("order_templates").delete().eq("id", id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to delete template");
    }
  };

  const editTemplate = (template: OrderTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      event_type: template.event_type,
      package_name: template.package_name,
      base_price: template.base_price || 0,
      customer_name: template.customer_name || "",
      customer_email: template.customer_email || "",
      is_active: template.is_active,
      default_options: template.default_options || {
        include_delivery: true,
        rush_order: false,
        special_requests: ""
      }
    });
    setIsCreateOpen(true);
  };

  const duplicateTemplate = async (template: OrderTemplate) => {
    try {
      const { error } = await supabase.from("order_templates").insert({
        name: `${template.name} (Copy)`,
        description: template.description,
        event_type: template.event_type,
        package_name: template.package_name,
        base_price: template.base_price,
        customer_name: template.customer_name,
        customer_email: template.customer_email,
        default_options: template.default_options,
        is_active: true,
        usage_count: 0
      });
      if (error) throw error;
      toast.success("Template duplicated");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to duplicate template");
    }
  };

  const useTemplate = async (template: OrderTemplate) => {
    await supabase
      .from("order_templates")
      .update({ usage_count: template.usage_count + 1 })
      .eq("id", template.id);

    const orderData = {
      event_type: template.event_type,
      package_name: template.package_name,
      base_price: template.base_price,
      customer_name: template.customer_name,
      customer_email: template.customer_email,
      options: template.default_options
    };

    const encodedData = encodeURIComponent(JSON.stringify(orderData));
    window.location.href = `/admin/orders/new?template=${encodedData}`;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await supabase.from("order_templates").update({ is_active: isActive }).eq("id", id);
      toast.success(isActive ? "Template activated" : "Template deactivated");
      fetchTemplates();
    } catch (err) {
      toast.error("Failed to update template");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      event_type: "",
      package_name: "",
      base_price: 0,
      customer_name: "",
      customer_email: "",
      is_active: true,
      default_options: {
        include_delivery: true,
        rush_order: false,
        special_requests: ""
      }
    });
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.package_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeTemplates = filteredTemplates.filter(t => t.is_active);
  const inactiveTemplates = filteredTemplates.filter(t => !t.is_active);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Order Templates</h2>
          <p className="text-muted-foreground">Reusable templates for recurring orders</p>
        </div>
        <Button onClick={() => { setEditingTemplate(null); resetForm(); setIsCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FilePlus2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No templates found</p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTemplates.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTemplates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description || "No description"}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        Used {template.usage_count}x
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-primary/10 text-primary">
                        <Calendar className="h-3 w-3 mr-1" />
                        {template.event_type}
                      </Badge>
                      <Badge variant="secondary">
                        <Package className="h-3 w-3 mr-1" />
                        {template.package_name}
                      </Badge>
                    </div>

                    {template.base_price && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">GHS {template.base_price.toLocaleString()}</span>
                      </div>
                    )}

                    {template.customer_name && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{template.customer_name}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => useTemplate(template)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Use
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editTemplate(template)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {inactiveTemplates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-muted-foreground">Inactive Templates</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactiveTemplates.map((template) => (
                  <Card key={template.id} className="opacity-60">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => toggleActive(template.id, checked)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{template.event_type}</Badge>
                        <Badge variant="outline">{template.package_name}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Template Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wedding Gold Package"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this template..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(v) => setFormData({ ...formData, event_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Package *</Label>
                <Select
                  value={formData.package_name}
                  onValueChange={(v) => setFormData({ ...formData, package_name: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packageOptions.map(pkg => (
                      <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Base Price (GHS)</Label>
              <Input
                type="number"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Default Customer Name</Label>
                <Input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label>Default Customer Email</Label>
                <Input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label>Default Options</Label>

              <div className="flex items-center justify-between">
                <span className="text-sm">Include Delivery</span>
                <Switch
                  checked={formData.default_options.include_delivery}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    default_options: { ...formData.default_options, include_delivery: checked }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Rush Order</span>
                <Switch
                  checked={formData.default_options.rush_order}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    default_options: { ...formData.default_options, rush_order: checked }
                  })}
                />
              </div>

              <div>
                <span className="text-sm">Special Requests</span>
                <Textarea
                  value={formData.default_options.special_requests}
                  onChange={(e) => setFormData({
                    ...formData,
                    default_options: { ...formData.default_options, special_requests: e.target.value }
                  })}
                  placeholder="Default special requests..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveTemplate} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OrderTemplates;

