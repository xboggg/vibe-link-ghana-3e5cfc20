import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderFormData, packages } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Check, Star } from "lucide-react";

interface PackageStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const PackageStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: PackageStepProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Package
        </h2>
        <p className="text-muted-foreground">
          Select the package that best fits your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((pkg, index) => {
          const isSelected = formData.selectedPackage === pkg.id;
          
          return (
            <motion.button
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => updateFormData({ selectedPackage: pkg.id })}
              className={cn(
                "relative p-5 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg"
                  : pkg.popular
                  ? "border-secondary bg-card hover:border-primary/50"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                    <Star className="h-3 w-3 fill-current" />
                    POPULAR
                  </span>
                </div>
              )}

              <div className="flex justify-between items-start mb-3 pt-1">
                <div>
                  <h3 className="font-bold text-lg text-foreground">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    GHS {pkg.price.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">📸</span>
                  <span className="text-foreground">{pkg.heroImages} hero image{pkg.heroImages > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">🕐</span>
                  <span className="text-foreground">{pkg.hosting} hosting</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">✏️</span>
                  <span className="text-foreground">{pkg.revisions} revision{pkg.revisions !== "1 round" && pkg.revisions !== "Unlimited" ? "s" : ""}</span>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <ul className="space-y-1">
                  {pkg.features.slice(0, 5).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <Check className="h-3 w-3 text-accent flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                  {pkg.features.length > 5 && (
                    <li className="text-xs text-primary font-medium pt-1">
                      +{pkg.features.length - 5} more features
                    </li>
                  )}
                </ul>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="selected-package"
                  className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrev} size="lg" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.selectedPackage}
          size="lg"
          className="gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
