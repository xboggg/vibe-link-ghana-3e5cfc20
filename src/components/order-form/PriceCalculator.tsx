import { motion } from "framer-motion";
import { OrderFormData, packages, addOns, eventTypes } from "@/data/orderFormData";
import { Calculator, Package, Plus, Zap } from "lucide-react";

interface PriceCalculatorProps {
  formData: OrderFormData;
  currentStep: number;
}

export const PriceCalculator = ({ formData, currentStep }: PriceCalculatorProps) => {
  const selectedPackage = packages.find((p) => p.id === formData.selectedPackage);
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  const selectedAddOnsList = formData.selectedAddOns.map((id) => addOns.find((a) => a.id === id)).filter(Boolean);

  const packagePrice = selectedPackage?.price || 0;
  const addOnsTotal = selectedAddOnsList.reduce((sum, addon) => sum + (addon?.price || 0), 0);
  const rushFee = formData.deliveryUrgency === "rush" ? 300 : 0;
  const total = packagePrice + addOnsTotal + rushFee;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        Price Calculator
      </h3>

      <div className="space-y-3">
        {/* Event Type */}
        {selectedEvent && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Event</span>
            <span className="text-foreground font-medium">{selectedEvent.name}</span>
          </div>
        )}

        {/* Package */}
        {selectedPackage ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-foreground font-medium">{selectedPackage.name}</span>
            </div>
            <span className="text-foreground font-bold">
              GHS {packagePrice.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Package</span>
            <span className="text-muted-foreground">Not selected</span>
          </div>
        )}

        {/* Add-ons */}
        {selectedAddOnsList.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Plus className="h-3 w-3" />
              Add-ons
            </div>
            {selectedAddOnsList.map((addon) => (
              <div key={addon?.id} className="flex justify-between text-xs pl-5">
                <span className="text-muted-foreground">{addon?.name}</span>
                <span className="text-foreground">+GHS {addon?.price}</span>
              </div>
            ))}
          </div>
        )}

        {/* Rush Delivery */}
        {formData.deliveryUrgency === "rush" && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-secondary" />
              <span className="text-foreground">Rush Delivery</span>
            </div>
            <span className="text-secondary font-bold">+GHS 300</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-foreground font-bold">Estimated Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.1, color: "hsl(var(--primary))" }}
            animate={{ scale: 1, color: "hsl(var(--foreground))" }}
            className="text-2xl font-bold"
          >
            GHS {total.toLocaleString()}
          </motion.span>
        </div>
        {total > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            50% deposit: GHS {Math.round(total / 2).toLocaleString()}
          </p>
        )}
      </div>

      {currentStep < 4 && (
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Complete step {currentStep} to see pricing
        </p>
      )}
    </motion.div>
  );
};
