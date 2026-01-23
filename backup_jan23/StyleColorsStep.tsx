import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, colorPalettes, stylePreferences } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Palette, Sparkles, Check, Upload, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { styleColorsSchema } from "@/lib/validationSchemas";

interface StyleColorsStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StyleColorsStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: StyleColorsStepProps) => {
  const [customColor1, setCustomColor1] = useState(formData.customColors[0] || "#6B46C1");
  const [customColor2, setCustomColor2] = useState(formData.customColors[1] || "#D4AF37");
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndProceed = () => {
    const result = styleColorsSchema.safeParse({
      colorPalette: formData.colorPalette,
      stylePreference: formData.stylePreference,
      customColors: formData.customColors,
      designNotes: formData.designNotes,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  const isValid = formData.colorPalette && formData.stylePreference;

  const handlePaletteSelect = (paletteId: string) => {
    updateFormData({ colorPalette: paletteId });
    if (paletteId === "custom") {
      updateFormData({ customColors: [customColor1, customColor2] });
    }
    setErrors((prev) => ({ ...prev, colorPalette: "" }));
  };

  const handleCustomColorChange = (index: number, color: string) => {
    if (index === 0) {
      setCustomColor1(color);
    } else {
      setCustomColor2(color);
    }
    updateFormData({ customColors: index === 0 ? [color, customColor2] : [customColor1, color] });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5 - uploadedImages.length); i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from("reference-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        // Create a signed URL for private bucket (valid for 1 hour for preview)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("reference-images")
          .createSignedUrl(fileName, 3600);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          console.error("Signed URL error:", signedUrlError);
          // Store the path for later retrieval
          newUrls.push(fileName);
        } else {
          newUrls.push(signedUrlData.signedUrl);
        }
      }

      if (newUrls.length > 0) {
        const allUrls = [...uploadedImages, ...newUrls];
        setUploadedImages(allUrls);
        updateFormData({ referenceImages: allUrls as any });
        toast.success(`${newUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== indexToRemove);
    setUploadedImages(newImages);
    updateFormData({ referenceImages: newImages as any });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Style & Color Preferences
        </h2>
        <p className="text-muted-foreground">
          Help us understand your design vision to reduce revisions.
        </p>
      </div>

      {/* Color Palettes */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-base">
          <Palette className="h-5 w-5 text-primary" />
          Choose a Color Palette
        </Label>
        {errors.colorPalette && (
          <p className="text-sm text-destructive">{errors.colorPalette}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {colorPalettes.map((palette) => {
            const isSelected = formData.colorPalette === palette.id;
            
            return (
              <motion.button
                key={palette.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePaletteSelect(palette.id)}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {/* Color Swatches */}
                <div className="flex gap-1 mb-2">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-6 h-6 rounded-full border border-border/50"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <h4 className="font-medium text-sm text-foreground">
                  {palette.name}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {palette.mood}
                </p>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Custom Color Picker */}
        {formData.colorPalette === "custom" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 rounded-xl bg-muted/50 border border-border space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Pick your custom colors:
            </p>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor1}
                    onChange={(e) => handleCustomColorChange(0, e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-xs text-muted-foreground uppercase">
                    {customColor1}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor2}
                    onChange={(e) => handleCustomColorChange(1, e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0"
                  />
                  <span className="text-xs text-muted-foreground uppercase">
                    {customColor2}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Style Preferences */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-primary" />
          Choose a Design Style
        </Label>
        {errors.stylePreference && (
          <p className="text-sm text-destructive">{errors.stylePreference}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stylePreferences.map((style) => {
            const isSelected = formData.stylePreference === style.id;
            
            return (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  updateFormData({ stylePreference: style.id });
                  setErrors((prev) => ({ ...prev, stylePreference: "" }));
                }}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all text-center",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <h4 className="font-semibold text-sm text-foreground mb-1">
                  {style.name}
                </h4>
                <p className="text-xs text-muted-foreground leading-tight">
                  {style.description}
                </p>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Reference Images Upload */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 text-base">
          <Image className="h-5 w-5 text-primary" />
          Reference Images (optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          Upload up to 5 reference images to help us understand your vision (Pinterest, Instagram screenshots, etc.)
        </p>
        
        <div className="flex flex-wrap gap-3">
          {uploadedImages.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Reference ${index + 1}`}
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {uploadedImages.length < 5 && (
            <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </>
              )}
            </label>
          )}
        </div>
      </div>

      {/* Design Notes */}
      <div className="space-y-2">
        <Label htmlFor="designNotes">Additional Design Notes (optional)</Label>
        <Textarea
          id="designNotes"
          placeholder="Any specific design requests? Reference links, inspirations, must-haves..."
          value={formData.designNotes}
          onChange={(e) => updateFormData({ designNotes: e.target.value })}
          rows={3}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          You can share Pinterest boards or Instagram references via WhatsApp after placing your order.
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={validateAndProceed} disabled={!isValid} size="lg" className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
