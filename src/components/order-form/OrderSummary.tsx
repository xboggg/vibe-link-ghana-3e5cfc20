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
            formData.selectedPackage === "royal"
              ? "Get your invitation in 7-10 days"
              : "Get your invitation in 5-7 days",
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
            <a href="tel:+233245817973" className="text-foreground hover:text-primary transition-colors">
              +233 24 581 7973
            </a>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            <a href="tel:+233244147594" className="text-foreground hover:text-primary transition-colors">
              +233 24 414 7594
            </a>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-500">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <a href="https://wa.me/4915757178561" className="text-foreground hover:text-green-500 transition-colors">
              +49 157 5717 8561
            </a>
          </li>
          <li className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-primary" />
            <a href="mailto:info@vibelinkgh.com" className="text-foreground hover:text-primary transition-colors">
              info@vibelinkgh.com
            </a>
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
