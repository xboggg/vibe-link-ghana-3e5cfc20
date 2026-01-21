import { motion } from "framer-motion";
import { OrderFormData, eventTypes, packages, colorPalettes, stylePreferences } from "@/data/orderFormData";
import { FileText, Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface OrderSummaryProps {
  formData: OrderFormData;
  total: number;
}

export const OrderSummary = ({ formData, total }: OrderSummaryProps) => {
  const selectedEvent = eventTypes.find((e) => e.id === formData.eventType);
  const selectedPackage = packages.find((p) => p.id === formData.selectedPackage);
  const selectedPalette = colorPalettes.find((c) => c.id === formData.colorPalette);
  const selectedStyle = stylePreferences.find((s) => s.id === formData.stylePreference);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      {/* What Happens Next */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          What Happens Next
        </h3>
        <ol className="space-y-3">
          {[
            "Submit this form",
            "We WhatsApp you within 2 hours",
            "Receive your custom quote",
            "Pay 50% deposit to start",
            "Get your invitation in 3-5 days",
          ].map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-foreground text-sm pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Prefer to Chat */}
      <div className="bg-muted/50 rounded-2xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-3">Prefer to Chat?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          WhatsApp us directly for a faster response.
        </p>
        <Button asChild variant="gold" className="w-full">
          <a
            href="https://wa.me/4915757178561"
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Chat on WhatsApp
          </a>
        </Button>
      </div>

      {/* Contact Info */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4">Contact Info</h3>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <span className="text-foreground">+233 24 581 7973</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-foreground">hello@vibelinkgh.com</span>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-foreground">Accra, Ghana</span>
          </li>
        </ul>
      </div>

      {/* Business Hours */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-secondary" />
          Business Hours
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-muted-foreground">Mon - Friday</span>
            <span className="text-foreground font-medium">9am - 5pm</span>
          </li>
          <li className="flex justify-between">
            <span className="text-muted-foreground">Saturday</span>
            <span className="text-foreground font-medium">10am - 4pm</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
};
