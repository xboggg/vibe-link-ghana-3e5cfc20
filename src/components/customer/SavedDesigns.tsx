import { useState, useEffect } from "react";
import { Heart, Trash2, ExternalLink, Loader2, FolderHeart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface SavedDesign {
  id: string;
  customer_email: string;
  design_type: string;
  design_name: string;
  design_url?: string;
  preview_url?: string;
  notes?: string;
  created_at: string;
}

interface SavedDesignsProps {
  customerEmail: string;
}

export function SavedDesigns({ customerEmail }: SavedDesignsProps) {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedDesigns();
  }, [customerEmail]);

  const fetchSavedDesigns = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("saved_designs")
        .select("*")
        .eq("customer_email", customerEmail.toLowerCase())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (err) {
      console.error("Error fetching saved designs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeDesign = async (designId: string) => {
    try {
      const { error } = await supabase
        .from("saved_designs")
        .delete()
        .eq("id", designId);

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      toast.success("Design removed from favorites");
    } catch (err) {
      console.error("Error removing design:", err);
      toast.error("Failed to remove design");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Saved Designs
        </CardTitle>
        <CardDescription>
          Your favorite designs and templates saved for inspiration
        </CardDescription>
      </CardHeader>
      <CardContent>
        {designs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {designs.map((design) => (
              <div
                key={design.id}
                className="border rounded-lg overflow-hidden group hover:border-primary transition-colors"
              >
                {design.preview_url ? (
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={design.preview_url}
                      alt={design.design_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {design.design_url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(design.design_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeDesign(design.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <FolderHeart className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="font-medium truncate">{design.design_name}</h4>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-muted-foreground capitalize">
                      {design.design_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(design.created_at), "MMM d")}
                    </span>
                  </div>
                  {design.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {design.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderHeart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">No saved designs yet</h4>
            <p className="text-sm text-muted-foreground">
              Browse our portfolio and save designs you love for inspiration!
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/portfolio">Browse Portfolio</a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SavedDesigns;

