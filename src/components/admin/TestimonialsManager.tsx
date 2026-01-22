import { useState, useEffect, useRef } from "react";
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
import { Plus, Pencil, Trash2, Star, Quote, GripVertical, Upload, X, ImageIcon, Loader2 } from "lucide-react";

interface Testimonial {
  id: string;
  client_name: string;
  event_type: string;
  content: string;
  rating: number;
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
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

const emptyTestimonial: Omit<Testimonial, "id" | "created_at"> = {
  client_name: "",
  event_type: "Wedding",
  content: "",
  rating: 5,
  image_url: null,
  is_featured: false,
};

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState(emptyTestimonial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      toast.error("Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image_url;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('testimonial-images')
        .upload(fileName, imageFile);

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('testimonial-images')
        .getPublicUrl(data.path);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.client_name.trim() || !formData.content.trim()) {
      toast.error("Name and testimonial content are required");
      return;
    }

    try {
      // Upload image if selected
      const imageUrl = await uploadImage();

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            client_name: formData.client_name,
            event_type: formData.event_type,
            content: formData.content,
            rating: formData.rating,
            image_url: imageUrl,
            is_featured: formData.is_featured,
          })
          .eq("id", editingTestimonial.id);

        if (error) throw error;
        toast.success("Testimonial updated successfully");
      } else {
        const { error } = await supabase
          .from("testimonials")
          .insert({
            client_name: formData.client_name,
            event_type: formData.event_type,
            content: formData.content,
            rating: formData.rating,
            image_url: imageUrl,
            is_featured: formData.is_featured,
          });

        if (error) throw error;
        toast.success("Testimonial created successfully");
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      setFormData(emptyTestimonial);
      setImageFile(null);
      setImagePreview(null);
      fetchTestimonials();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      toast.error("Failed to save testimonial");
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      client_name: testimonial.client_name,
      event_type: testimonial.event_type,
      content: testimonial.content,
      rating: testimonial.rating,
      image_url: testimonial.image_url,
      is_featured: testimonial.is_featured,
    });
    setImagePreview(testimonial.image_url);
    setImageFile(null);
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
        .update({ is_featured: !testimonial.is_featured })
        .eq("id", testimonial.id);

      if (error) throw error;
      toast.success(`Testimonial ${testimonial.is_featured ? "unfeatured" : "featured"}`);
      fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Failed to update testimonial");
    }
  };

  const openNewDialog = () => {
    setEditingTestimonial(null);
    setFormData(emptyTestimonial);
    setImageFile(null);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, image_url: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
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
                <Label htmlFor="content">Testimonial Quote *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Client Photo</Label>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="testimonial-image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={clearImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="testimonial-image"
                      className="flex flex-col items-center gap-2 cursor-pointer py-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Click to upload photo</span>
                    </label>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      <strong>Recommended:</strong> 400x400px square, JPG/PNG/WebP
                    </p>
                    <p>• Maximum file size: 2MB</p>
                    <p>• Use high-quality photos of real Ghanaian clients</p>
                    <p>• Photos will display as circular thumbnails on the homepage</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured on homepage</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingImage}>
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>{editingTestimonial ? "Update" : "Create"} Testimonial</>
                  )}
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
                  
                  {/* Thumbnail preview */}
                  {testimonial.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-foreground">{testimonial.client_name}</h3>
                      <Badge variant="secondary">{testimonial.event_type}</Badge>
                      {testimonial.is_featured && (
                        <Badge variant="default" className="bg-secondary text-secondary-foreground">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                      ))}
                    </div>

                    <p className="text-muted-foreground italic line-clamp-2">
                      "{testimonial.content}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(testimonial)}
                      title={testimonial.is_featured ? "Unfeature" : "Feature"}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          testimonial.is_featured
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
                            Are you sure you want to delete this testimonial from {testimonial.client_name}?
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
