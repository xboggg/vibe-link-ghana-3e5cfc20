import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormData, colorPalettes, stylePreferences } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Palette, Sparkles, Check } from "lucide-react";

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

  const isValid = formData.colorPalette && formData.stylePreference;

  const handlePaletteSelect = (paletteId: string) => {
    updateFormData({ colorPalette: paletteId });
    if (paletteId === "custom") {
      updateFormData({ customColors: [customColor1, customColor2] });
    }
  };

  const handleCustomColorChange = (index: number, color: string) => {
    if (index === 0) {
      setCustomColor1(color);
    } else {
      setCustomColor2(color);
    }
    updateFormData({ customColors: index === 0 ? [color, customColor2] : [customColor1, color] });
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stylePreferences.map((style) => {
            const isSelected = formData.stylePreference === style.id;
            
            return (
              <motion.button
                key={style.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFormData({ stylePreference: style.id })}
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

      {/* Design Notes */}
      <div className="space-y-2">
        <Label htmlFor="designNotes">Additional Design Notes (optional)</Label>
        <Textarea
          id="designNotes"
          placeholder="Any specific design requests? Reference links, inspirations, must-haves..."
          value={formData.designNotes}
          onChange={(e) => updateFormData({ designNotes: e.target.value })}
          rows={3}
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
        <Button onClick={onNext} disabled={!isValid} size="lg" className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
