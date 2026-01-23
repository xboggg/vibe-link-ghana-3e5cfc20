import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderFormData, addOns, packages } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";

interface AddOnsStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const categoryLabels: Record<string, string> = {
  delivery: "⚡ Delivery",
  design: "🎨 Design",
  features: "✨ Features",
  language: "🌍 Language",
  hosting: "🏠 Hosting",
};

export const AddOnsStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: AddOnsStepProps) => {
  const selectedPackage = packages.find((p) => p.id === formData.selectedPackage);
  
  // Group add-ons by category
  const groupedAddOns = addOns.reduce((acc, addon) => {
    if (!acc[addon.category]) {
      acc[addon.category] = [];
    }
    acc[addon.category].push(addon);
    return acc;
  }, {} as Record<string, typeof addOns>);

  const toggleAddOn = (addonId: string) => {
    const current = formData.selectedAddOns;
    if (current.includes(addonId)) {
      updateFormData({
        selectedAddOns: current.filter((id) => id !== addonId),
      });
    } else {
      updateFormData({
        selectedAddOns: [...current, addonId],
      });
    }
  };

  const addOnsTotal = formData.selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find((a) => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Enhance Your Invitation
        </h2>
        <p className="text-muted-foreground">
          Add extra features to make your invitation even more special. These are optional.
        </p>
        {selectedPackage && (
          <div className="mt-2 p-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">Your package: </span>
            <span className="font-semibold text-foreground">{selectedPackage.name}</span>
            <span className="text-muted-foreground"> • Some features may already be included</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(groupedAddOns).map(([category, categoryAddOns]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-foreground">
              {categoryLabels[category] || category}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryAddOns.map((addon) => {
                const isSelected = formData.selectedAddOns.includes(addon.id);
                
                return (
                  <motion.button
                    key={addon.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => toggleAddOn(addon.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all text-left",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        ) : (
                          <Plus className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {addon.name}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        isSelected ? "text-primary" : "text-secondary"
                      )}
                    >
                      {addon.priceLabel}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {formData.selectedAddOns.length > 0 && (
        <div className="p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              {formData.selectedAddOns.length} add-on{formData.selectedAddOns.length > 1 ? "s" : ""} selected
            </span>
            <span className="text-lg font-bold text-foreground">
              +GHS {addOnsTotal.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="gap-2">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
