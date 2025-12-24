import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrderFormData, eventTypes } from "@/data/orderFormData";
import { ArrowRight } from "lucide-react";

interface EventTypeStepProps {
  formData: OrderFormData;
  updateFormData: (updates: Partial<OrderFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const EventTypeStep = ({
  formData,
  updateFormData,
  onNext,
}: EventTypeStepProps) => {
  const handleSelect = (eventId: string) => {
    updateFormData({ eventType: eventId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          What are we celebrating?
        </h2>
        <p className="text-muted-foreground">
          Choose the type of event for your digital invitation.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {eventTypes.map((event, index) => {
          const Icon = event.icon;
          const isSelected = formData.eventType === event.id;
          
          return (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleSelect(event.id)}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 text-center group hover:scale-105",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-primary/50"
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3
                  className={cn(
                    "font-semibold text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {event.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  {event.description}
                </p>
              </div>
              {isSelected && (
                <motion.div
                  layoutId="selected-event"
                  className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-primary-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={onNext}
          disabled={!formData.eventType}
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
