import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Quote, GripVertical } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  event_type: string;
  quote: string;
  rating: number;
  image_url: string | null;
  featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const eventTypes = [
  "Wedding",
  "Funeral",
  "Naming Ceremony",
  "Birthday",
  "Graduation",
  "Anniversary",
  "Corporate Event",
  "Church Event",
];

const emptyTestimonial: Omit<Testimonial, "id" | "created_at" | "updated_at"> = {
  name: "",
  event_type: "Wedding",
  quote: "",
  rating: 5,
  image_url: null,
  featured: false,
  display_order: 0,
};

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(emptyTestimonial);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.quote.trim()) {
      toast.error("Name and quote are required");
      return;
    }

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            name: formData.name,
            event_type: formData.event_type,
            quote: formData.quote,
            rating: formData.rating,
            image_url: formData.image_url,
            featured: formData.featured,
            display_order: formData.display_order,
          })
          .eq("id", editingTestimonial.id);

        if (error) throw error;
        toast.success("Testimonial updated successfully");
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert({
            name: formData.name,
            event_type: formData.event_type,
            quote: formData.quote,
            rating: formData.rating,
            image_url: formData.image_url,
            featured: formData.featured,
            display_order: testimonials.length + 1,
          });

        if (error) throw error;
        toast.success("Testimonial created successfully");
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      setFormData(emptyTestimonial);
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      event_type: testimonial.event_type,
      quote: testimonial.quote,
      rating: testimonial.rating,
      image_url: testimonial.image_url,
      featured: testimonial.featured,
      display_order: testimonial.display_order,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast.error("Failed to delete testimonial");
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ featured: !testimonial.featured })
        .eq("id", testimonial.id);

      if (error) throw error;
      toast.success(`Testimonial ${testimonial.featured ? "unfeatured" : "featured"}`);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Failed to update testimonial");
    }
  };

  const openNewDialog = () => {
    setEditingTestimonial(null);
    setFormData(emptyTestimonial);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Testimonials</h2>
          <p className="text-muted-foreground">Manage client testimonials displayed on the website</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Akosua & Kwame"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quote">Testimonial Quote *</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="What did the client say about your service?"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= formData.rating
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">Featured on homepage</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTestimonial ? "Update" : "Create"} Testimonial
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Testimonials Grid */}
      <div className="grid gap-4">
        {testimonials.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Quote className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No testimonials yet</p>
              <Button onClick={openNewDialog} className="mt-4">
                Add Your First Testimonial
              </Button>
            </CardContent>
          </Card>
        ) : (
          testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 cursor-grab">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                      <Badge variant="secondary">{testimonial.event_type}</Badge>
                      {testimonial.featured && (
                        <Badge variant="default" className="bg-secondary text-secondary-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>
                    
                    <p className="text-muted-foreground italic line-clamp-2">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(testimonial)}
                      title={testimonial.featured ? "Unfeature" : "Feature"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          testimonial.featured
                            ? "fill-secondary text-secondary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this testimonial from {testimonial.name}?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(testimonial.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
