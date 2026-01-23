import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OrderFormData } from "@/data/orderFormData";
import { ArrowLeft, ArrowRight, Zap, Clock, Calendar, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TimelineStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const TimelineStep = ({
  formData,
  updateFormData,
  onNext,
  onPrev,
}: TimelineStepProps) => {
  // Royal package takes 7-10 days, others take 5-7 days
  const isRoyalPackage = formData.selectedPackage === "royal";
  const standardDays = isRoyalPackage ? 10 : 7;
  const standardDelivery = addDays(new Date(), standardDays);
  const rushDelivery = addDays(new Date(), 2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          When do you need it?
        </h2>
        <p className="text-muted-foreground">
          Choose your preferred delivery timeline.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Standard Delivery */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateFormData({ deliveryUrgency: "standard" })}
          className={cn(
            "relative p-6 rounded-xl border-2 transition-all text-left",
            formData.deliveryUrgency === "standard"
              ? "border-primary bg-primary/5 shadow-lg"
              : "border-border bg-card hover:border-primary/50"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Standard</h3>
              <p className="text-sm text-muted-foreground">
                {isRoyalPackage ? "7-10 business days" : "5-7 business days"}
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated by: <span className="font-semibold text-foreground">{format(standardDelivery, "EEEE, MMM d")}</span>
          </div>
          <div className="mt-2 text-lg font-bold text-accent">Included</div>

          {formData.deliveryUrgency === "standard" && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </motion.button>

        {/* Rush Delivery */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateFormData({ deliveryUrgency: "rush" })}
          className={cn(
            "relative p-6 rounded-xl border-2 transition-all text-left",
            formData.deliveryUrgency === "rush"
              ? "border-secondary bg-secondary/5 shadow-lg"
              : "border-border bg-card hover:border-secondary/50"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Rush Delivery</h3>
              <p className="text-sm text-muted-foreground">48 hours</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated by: <span className="font-semibold text-foreground">{format(rushDelivery, "EEEE, MMM d")}</span>
          </div>
          <div className="mt-2 text-lg font-bold text-secondary">+GHS 300</div>

          {formData.deliveryUrgency === "rush" && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </motion.button>
      </div>

      {/* Delivery time info note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm">
        <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">Delivery times:</span> Starter, Classic & Prestige packages take 5-7 days. Royal package takes 7-10 days due to premium features.
        </p>
      </div>

      {/* Preferred Delivery Date */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Preferred Delivery Date (optional)
        </Label>
        <p className="text-sm text-muted-foreground">
          If you have a specific date in mind, let us know. We'll do our best to accommodate.
        </p>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !formData.preferredDeliveryDate && "text-muted-foreground"
              )}
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formData.preferredDeliveryDate ? (
                format(formData.preferredDeliveryDate, "PPP")
              ) : (
                "Pick a date"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={formData.preferredDeliveryDate || undefined}
              onSelect={(date) => updateFormData({ preferredDeliveryDate: date || null })}
              initialFocus
              disabled={(date) => date < addDays(new Date(), 1)}
            />
          </PopoverContent>
        </Popover>
      </div>

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
